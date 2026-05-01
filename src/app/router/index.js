import { Router } from "express";
import { bookingRoutes } from "../modules/booking/booking.route.js";
import { experienceRoutes } from "../modules/experience/experience.route.js";
import { webhookRoutes } from "../modules/webhook/webhook.route.js";

export const router = Router();
const moduleRoutes = [];

moduleRoutes.push({
  path: "/bookings",
  route: bookingRoutes,
});

moduleRoutes.push({
  path: "/experiences",
  route: experienceRoutes,
});

moduleRoutes.push({
  path: "/webhooks",
  route: webhookRoutes,
});

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});
