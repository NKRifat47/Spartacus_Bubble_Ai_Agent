import prisma from "../../prisma/client.js";
import axios from "axios";
import { envVars } from "../../config/env.js";

const normalizeTime = (value) => {
  if (!value) return "";
  return String(value)
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/:/g, ":")
    .replace(/\./g, "")
    .replace(/(^|,)0+([0-9]:)/g, "$1$2");
};

const toYmd = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export const checkRezgoAvailability = async ({
  experienceId,
  date,
  timeSlot,
  people,
  experienceName,
}) => {
  const d = toYmd(date);
  if (!experienceId || !d) {
    return {
      available: false,
      remaining: null,
      reason: "Missing experienceId or date",
      rezgo: null,
    };
  }

  const runSearch = async (t, q) => {
    const response = await axios.get("https://api.rezgo.com/json", {
      params: {
        transcode: envVars.REZGO_CID,
        key: envVars.REZGO_API_KEY,
        i: "search",
        t,
        q,
        d,
      },
      timeout: 15000,
    });

    const rezgo = response.data;
    const rawItems = rezgo?.item ?? [];
    const items = Array.isArray(rawItems)
      ? rawItems
      : rawItems
        ? [rawItems]
        : [];

    return { rezgo, items };
  };

  const attempts = [];
  const tryOnce = async (t, q) => {
    const { rezgo, items } = await runSearch(t, q);
    attempts.push({ t, q, total: rezgo?.total ?? null });
    return { rezgo, items };
  };

  // We use UID as the canonical Rezgo identifier.
  let { rezgo, items } = await tryOnce("uid", experienceId);

  // 2) fallback: smart search by id (handles cases where com/uid is wrong)
  if (!items.length) ({ rezgo, items } = await tryOnce("smart", experienceId));

  // 3) fallback: name search (useful when frontend sends a human name)
  if (!items.length && experienceName) {
    ({ rezgo, items } = await tryOnce("name", experienceName));
  }

  if (!items.length) {
    return {
      available: false,
      remaining: 0,
      reason: `Rezgo returned no matching items (attempts: ${attempts
        .map((a) => `${a.t}:${a.q}`)
        .join(", ")})`,
      rezgo: { ...rezgo, attempts },
    };
  }

  const requestedTime = normalizeTime(timeSlot);
  const matched =
    requestedTime && requestedTime.length
      ? items.find((it) => {
          if (normalizeTime(it?.time).includes(requestedTime)) return true;
          
          const timeListRaw = it?.date?.time_data?.time ?? null;
          const timeList = Array.isArray(timeListRaw)
            ? timeListRaw
            : timeListRaw
              ? [timeListRaw]
              : [];
              
          return timeList.some((t) => normalizeTime(t?.id) === requestedTime);
        })
      : items[0];

  if (!matched) {
    return {
      available: false,
      remaining: 0,
      reason: "Requested timeSlot not found in Rezgo options",
      rezgo,
    };
  }

  const dateNode = matched?.date;
  // Prefer time-specific availability if Rezgo returns dynamic `time_data`.
  const timeListRaw = dateNode?.time_data?.time ?? null;
  const timeList = Array.isArray(timeListRaw)
    ? timeListRaw
    : timeListRaw
      ? [timeListRaw]
      : [];

  const timeMatch =
    requestedTime && timeList.length
      ? timeList.find((t) => normalizeTime(t?.id) === requestedTime)
      : null;

  const availabilityRaw =
    timeMatch?.av ??
    dateNode?.availability ??
    dateNode?.total_availability ??
    matched?.availability ??
    matched?.total_availability ??
    null;

  const remaining =
    availabilityRaw === null || availabilityRaw === undefined
      ? null
      : Number(availabilityRaw);

  const needed = people ? Number(people) : 1;

  if (remaining === null || Number.isNaN(remaining)) {
    // Some items may require a different target (uid vs com) or different time format.
    return {
      available: false,
      remaining: null,
      reason:
        "Rezgo did not return a numeric availability for this option/date",
      rezgo,
    };
  }

  if (remaining < needed) {
    return {
      available: false,
      remaining,
      reason: "Not enough spots available",
      rezgo,
    };
  }

  return {
    available: true,
    remaining,
    reason: null,
    rezgo,
  };
};

export const createBooking = async (payload) => {
  const {
    name,
    email,
    phone,
    planningType,
    city,
    region,
    people,
    date,
    timeSlot,
    experienceId,
    experienceName,
    experiencePrice,
    currency,
    activityPrimary,
    activitySecondary,
    customerNote,
    source,
  } = payload;

  const availability = await checkRezgoAvailability({
    experienceId,
    date,
    timeSlot,
    people,
    experienceName,
  });

  return prisma.booking.create({
    data: {
      name,
      email,
      phone,
      planningType,
      city,
      region,
      people,
      date,
      timeSlot,
      experienceId,
      experienceName,
      experiencePrice,
      currency,
      activityPrimary,
      activitySecondary,
      customerNote,
      source,
      status: availability.available ? "AVAILABLE" : "NOT_AVAILABLE",
      note: availability.available ? null : availability.reason,
      isChecked: true,
      rawPayload: {
        ...payload,
        rezgoAvailability: availability,
      },
    },
  });
};
