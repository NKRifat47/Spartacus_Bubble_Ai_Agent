import { Router } from "express";
import validateRequest from "../../middleware/validateRequest.js";
import { createBookingSchema } from "./booking.validation.js";
import { bookingController } from "./booking.controller.js";

const router = Router();

router.post(
  "/",
  validateRequest(createBookingSchema),
  bookingController.create,
);

export const bookingRoutes = router;
