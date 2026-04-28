import { Router } from "express";
import validateRequest from "../../middleware/validateRequest.js";
import {
  listExperiencesSchema,
  listTimesSchema,
} from "./experience.validation.js";
import { experienceController } from "./experience.controller.js";

const router = Router();

// GET /api/experiences?city=LIVERPOOL&planningType=STAG%20DO&q=double&limit=40
router.get(
  "/",
  validateRequest(listExperiencesSchema),
  experienceController.list,
);

// GET /api/experiences/:uid/times?date=2026-04-29&people=12
router.get(
  "/:uid/times",
  validateRequest(listTimesSchema),
  experienceController.times,
);

export const experienceRoutes = router;
