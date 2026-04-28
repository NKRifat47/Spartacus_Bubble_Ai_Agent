import axios from "axios";
import { envVars } from "../../config/env.js";

const toArray = (value) => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const planningToTag = (planningType) => {
  const v = String(planningType || "").toLowerCase();
  if (!v) return null;
  if (v.includes("stag")) return "stag";
  if (v.includes("hen")) return "hen";
  if (v.includes("birthday")) return "birthday";
  if (v.includes("kids")) return "kids";
  return null;
};

export const rezgoSearch = async ({ t = "smart", q, d }) => {
  const response = await axios.get("https://api.rezgo.com/json", {
    params: {
      transcode: envVars.REZGO_CID,
      key: envVars.REZGO_API_KEY,
      i: "search",
      t,
      q,
      ...(d ? { d } : {}),
    },
    timeout: 20000,
  });
  return response.data;
};

export const listExperiences = async ({
  city,
  planningType,
  q,
  limit = 60,
}) => {
  const parts = [];
  if (q) parts.push(q);
  if (city) parts.push(city);
  const planTag = planningToTag(planningType);
  if (planTag) parts.push(planTag);

  // `smart` search is the most forgiving; it will match tags, item name, etc.
  const query = parts.filter(Boolean).join(" ");
  const rezgo = await rezgoSearch({ t: "smart", q: query || "*" });

  const items = toArray(rezgo?.item);
  const normalized = items.slice(0, limit).map((it) => {
    const uid = String(it?.uid ?? "");
    const com = String(it?.com ?? "");
    const title = String(it?.item ?? "");
    const option = String(it?.option ?? "");

    return {
      uid,
      com,
      slug: `rezgo-${uid}-${slugify(option || title)}`,
      title,
      option,
      startingPrice: it?.starting ? Number(it.starting) : null,
      currency: it?.currency_base ?? null,
      timeFormat: it?.time_format ?? null,
      defaultTime: it?.time ?? null,
      tags: it?.tags ?? null,
      location: {
        city: it?.city ?? null,
        state: it?.state ?? null,
        country: it?.country ?? null,
        name: it?.location_name ?? null,
        address: it?.location_address ?? null,
      },
      media: {
        total: it?.media?.total ?? it?.media?.["@attributes"]?.value ?? null,
        images: toArray(it?.media?.image)
          .map((img) => img?.path)
          .filter(Boolean),
      },
      rezgo: {
        uid,
        com,
      },
    };
  });

  return {
    total: rezgo?.total ? Number(rezgo.total) : normalized.length,
    items: normalized,
  };
};

export const listAvailableTimes = async ({ uid, date, people = 1 }) => {
  const rezgo = await rezgoSearch({ t: "uid", q: uid, d: date });
  const item = Array.isArray(rezgo?.item) ? rezgo.item[0] : rezgo?.item;

  const dateNode = item?.date;
  const timeList = toArray(dateNode?.time_data?.time);

  const times = timeList
    .map((t) => {
      const av = t?.av === undefined || t?.av === null ? null : Number(t.av);
      return {
        id: t?.id ?? null,
        available: av,
        canBook: av !== null && !Number.isNaN(av) ? av >= people : false,
      };
    })
    .filter((t) => t.id);

  return {
    uid: String(uid),
    date: dateNode?.value ?? date,
    people,
    active: dateNode?.active ?? null,
    times,
    rezgo,
  };
};
