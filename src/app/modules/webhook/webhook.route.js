import { Router } from "express";
import multer from "multer";
import { webhookController } from "./webhook.controller.js";

export const webhookRoutes = Router();

// SendGrid Inbound Parse sends data as multipart/form-data
// Memory storage is sufficient since we only need text fields, no large files
const upload = multer();

webhookRoutes.post("/sendgrid/inbound", upload.none(), webhookController.sendgridInbound);
