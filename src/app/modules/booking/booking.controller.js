import { StatusCodes } from "http-status-codes";
import { sendResponse } from "../../utils/sendResponse.js";
import { createBooking } from "./booking.service.js";

export const bookingController = {
  create: async (req, res, next) => {
    try {
      const result = await createBooking(req.body);
      const remaining =
        result?.rawPayload?.rezgoAvailability?.remaining ?? null;
      const requested = req?.body?.people ?? null;
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

