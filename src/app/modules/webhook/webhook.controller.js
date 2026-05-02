import { StatusCodes } from "http-status-codes";
import { sendResponse } from "../../utils/sendResponse.js";
import axios from "axios";
import { envVars } from "../../config/env.js";
import { sendGridEmail } from "../../utils/sendGridEmail.js";

export const webhookController = {
  sendgridInbound: async (req, res, next) => {
    try {
      // SendGrid sends payload via multipart/form-data
      const { from, subject, text } = req.body;

      // 'from' might look like "John Doe <johndoe@example.com>"
      const fromEmailMatch = from?.match(/<(.+)>/);
      const fromEmail = fromEmailMatch ? fromEmailMatch[1] : from;

      if (!fromEmail || !text) {
        return res.status(StatusCodes.OK).send("Missing from or text");
      }

      console.log(`Received inbound email reply from ${fromEmail}`);

      let aiText =
        "Thank you for your message. We have received your inquiry and will get back to you shortly.";

      if (envVars.AI_ENGINE_URL) {
        try {
          console.log("Forwarding user reply to AI Engine...");
          const aiPrompt = `The customer has replied to our previous email. Here is their reply:\n\n"${text}"\n\nIMPORTANT: Please write a polite and helpful response. Do not use generic placeholders like [Your Name]. Please end the email exactly with this signature:\nBest regards,\nSpartacus Support\nSpartacus Bubble Soccer Team\nEmail: hi@spartacusbublesoccer.co.uk\nWebsite: https://spartacusbubble.rezgo.com/`;

          const aiResponse = await axios.post(
            `${envVars.AI_ENGINE_URL}/reply`,
            {
              message: aiPrompt,
            },
          );

          let rawAiText =
            aiResponse?.data?.reply ||
            aiResponse?.data?.message ||
            aiResponse?.data?.response ||
            aiResponse?.data;

          if (typeof rawAiText === "string" && rawAiText.trim() !== "") {
            // Cleanup any stray placeholders
            aiText = rawAiText
              .replace(/\[Your Name\]/gi, "Spartacus Support")
              .replace(
                /\[Contact Information\]/gi,
                "hi@spartacusbublesoccer.co.uk",
              )
              .replace(
                /\[Website Link\]/gi,
                "https://spartacusbubble.rezgo.com/",
              );
            console.log("Successfully generated AI response for user reply.");
          }
        } catch (err) {
          console.error(
            "Failed to get response from AI Engine for inbound email:",
            err?.message || err,
          );
        }
      }

      // Send the AI's reply back to the user
      await sendGridEmail({
        to: fromEmail,
        subject: `Re: ${subject ? subject.replace(/^Re:\s*/i, "") : "Your Booking Request"}`,
        text: aiText,
      });

      console.log(`✅ Sent AI response back to ${fromEmail}`);

      // SendGrid expects a 200 OK or it will keep retrying the webhook
      return res.status(StatusCodes.OK).send("OK");
    } catch (error) {
      console.error("Webhook processing error:", error);
      // Still return 200 so SendGrid doesn't retry infinitely on a bad payload
      return res.status(StatusCodes.OK).send("Error processed");
    }
  },
};
