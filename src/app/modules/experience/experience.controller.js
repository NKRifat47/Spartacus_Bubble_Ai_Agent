import { StatusCodes } from "http-status-codes";
import { sendResponse } from "../../utils/sendResponse.js";
import { listAvailableTimes, listExperiences } from "./experience.service.js";

export const experienceController = {
  list: async (req, res, next) => {
    try {
      const result = await listExperiences(req.query);
      return sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Experiences fetched successfully",
        data: result,
      });
    } catch (err) {
      return next(err);
    }
  },

  times: async (req, res, next) => {
    try {
      const result = await listAvailableTimes({
        uid: req.params.uid,
        date: req.query.date,
        people: req.query.people,
      });
      return sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Experience times fetched successfully",
        data: result,
      });
    } catch (err) {
      return next(err);
    }
  },
};
