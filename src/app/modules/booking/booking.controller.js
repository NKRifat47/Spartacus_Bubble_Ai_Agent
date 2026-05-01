import { StatusCodes } from "http-status-codes";
import { sendResponse } from "../../utils/sendResponse.js";
import { createBooking } from "./booking.service.js";
import { sendGridEmail } from "../../utils/sendGridEmail.js";
import { listAvailableTimes } from "../experience/experience.service.js";
import { envVars } from "../../config/env.js";
import axios from "axios";

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

        let text = "";
        if (status === "AVAILABLE") {
          text = `Hi ${result?.name || ""}\n\nGood news — your requested slot is available.\n\nExperience: ${result?.experienceName || ""}\nDate: ${result?.date}\nTime: ${result?.timeSlot}\nPeople: ${requested}\nRemaining: ${remaining}\n\nWe'll contact you shortly with next steps.\n`;
        } else {
          let alternativeText = "Please try a different time or date.\n";
          try {
            if (result?.experienceId && result?.date) {
              const availableTimesData = await listAvailableTimes({
                uid: result.experienceId,
                date: result.date,
                people: requested || 1,
              });
              const alternatives = (availableTimesData?.times || []).filter((t) => t.canBook);
              
              if (alternatives.length > 0) {
                alternativeText = `However, we do have the following slots available on ${result.date}:\n`;
                alternatives.forEach((t) => {
                  alternativeText += `- ${t.id} (${t.available} spots remaining)\n`;
                });
                alternativeText += `\nPlease reply to this email or book one of these available slots on our website.\n`;
              } else {
                alternativeText = `Unfortunately, there are no other slots available on ${result.date}. Please try a different date.\n`;
              }
            }
          } catch (err) {
            console.error("Failed to fetch alternative slots:", err);
          }

          text = `Hi ${result?.name || ""}\n\nSorry — your requested slot is not available.\n\nReason: ${reason}\n\nExperience: ${result?.experienceName || ""}\nDate: ${result?.date}\nTime: ${result?.timeSlot}\nPeople requested: ${requested}\nRemaining: ${remaining}\n\n${alternativeText}`;
          
          if (envVars.AI_ENGINE_URL) {
            try {
              console.log("Sending message to AI Engine...");
              
              const aiPrompt = `${text}\n\nIMPORTANT: When generating your reply, do not use generic placeholders like [Your Name]. Please end the email exactly with this signature:\nBest regards,\nSpartacus Support\nSpartacus Bubble Soccer Team\nEmail: hi@spartacusbublesoccer.co.uk\nWebsite: https://spartacusbubble.rezgo.com/`;

              const aiResponse = await axios.post(`${envVars.AI_ENGINE_URL}/reply`, {
                message: aiPrompt
              });
              
              let aiText = aiResponse?.data?.reply || aiResponse?.data?.message || aiResponse?.data?.response || aiResponse?.data;
              if (typeof aiText === "string" && aiText.trim() !== "") {
                // Fallback cleanup in case AI still outputs placeholders
                aiText = aiText.replace(/\[Your Name\]/gi, "Spartacus Support")
                               .replace(/\[Contact Information\]/gi, "hi@spartacusbublesoccer.co.uk")
                               .replace(/\[Website Link\]/gi, "https://spartacusbubble.rezgo.com/");
                               
                text = aiText;
                console.log("Successfully replaced message with AI response.");
              } else {
                console.warn("AI Engine returned an unexpected format:", aiResponse.data);
              }
            } catch (err) {
              console.error("Failed to get response from AI Engine:", err?.message || err);
            }
          }
        }

        sendGridEmail({ to, subject, text })
          .then((info) => {
            console.log(
              "✅ SendGrid email queued:",
              to,
              info?.statusCode || "",
            );
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
