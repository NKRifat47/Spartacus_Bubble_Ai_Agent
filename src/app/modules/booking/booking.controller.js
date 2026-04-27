import { StatusCodes } from "http-status-codes";
import { sendResponse } from "../../utils/sendResponse.js";
import { createBooking } from "./booking.service.js";
import { sendGridEmail } from "../../utils/sendGridEmail.js";

export const bookingController = {
  create: async (req, res, next) => {
    try {
      const result = await createBooking(req.body);
      const remaining =
        result?.rawPayload?.rezgoAvailability?.remaining ?? null;
      const requested = req?.body?.people ?? null;

      // Send email notification (do not fail the booking if email fails)
      const to = result?.email;
      if (to) {
        const status = result?.status;
        const reason = result?.note ?? "";
        const subject =
          status === "AVAILABLE"
            ? "Your requested slot is available"
            : "Your requested slot is not available";

        const text =
          status === "AVAILABLE"
            ? `Hi ${result?.name || ""}\n\nGood news — your requested slot is available.\n\nExperience: ${result?.experienceName || ""}\nDate: ${result?.date}\nTime: ${result?.timeSlot}\nPeople: ${requested}\nRemaining: ${remaining}\n\nWe'll contact you shortly with next steps.\n`
            : `Hi ${result?.name || ""}\n\nSorry — your requested slot is not available.\n\nReason: ${reason}\n\nExperience: ${result?.experienceName || ""}\nDate: ${result?.date}\nTime: ${result?.timeSlot}\nPeople requested: ${requested}\nRemaining: ${remaining}\n\nPlease try a different time or date.\n`;

        sendGridEmail({ to, subject, text })
          .then((info) => {
            console.log("✅ SendGrid email queued:", to, info?.statusCode || "");
          })
          .catch((err) => {
          console.error(
            "❌ SendGrid email failed:",
            err?.statusCode || "",
            err?.message || err,
            err?.details ? JSON.stringify(err.details) : "",
          );
          });
      }
      return sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: "Booking enquiry stored successfully",
        data: result,
        extra: {
          remaining,
          requested,
        },
      });
    } catch (err) {
      return next(err);
    }
  },
};

