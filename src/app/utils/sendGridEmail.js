import sgMail from "@sendgrid/mail";
import { envVars } from "../config/env.js";

const isConfigured = () =>
  Boolean(envVars.SENDGRID_API_KEY && envVars.SENDGRID_FROM);

export const sendGridEmail = async ({ to, subject, text, html }) => {
  if (!isConfigured()) {
    throw new Error(
      "SendGrid is not configured (missing SENDGRID_API_KEY or SENDGRID_FROM)",
    );
  }

  sgMail.setApiKey(envVars.SENDGRID_API_KEY);

  try {
    const [resp] = await sgMail.send({
      to,
      from: envVars.SENDGRID_FROM,
      subject,
      text,
      html,
    });
    return {
      statusCode: resp?.statusCode ?? 202,
    };
  } catch (err) {
    const statusCode = err?.code ?? err?.response?.statusCode ?? null;
    const body = err?.response?.body ?? null;
    const message =
      body?.errors?.[0]?.message || err?.message || "SendGrid request failed";

    const error = new Error(message);
    error.statusCode = statusCode;
    error.details = body;
    throw error;
  }
};
