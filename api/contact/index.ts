import type { VercelRequest, VercelResponse } from "@vercel/node";
import { cors } from "../../lib/cors";
import { requireAdmin } from "../../lib/auth";
import { ContactService } from "../../services/contact.services";

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS and preflight
  if (cors(req, res)) return;
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    // POST /api/contact - Create contact message (public)
    if (req.method === "POST") {
      const { name, email, phone, subject, message } = req.body;

      if (!name || !email || !subject || !message) {
        return res.status(400).json({
          message: "name, email, subject, and message are required",
        });
      }

      const contactMessage = await ContactService.create({
        name,
        email,
        phone,
        subject,
        message,
      });

      return res.status(201).json({
        message: "message sent successfully",
        data: contactMessage,
      });
    }

    // GET /api/contact - Get all contact messages (admin only)
    if (req.method === "GET") {
      const user = requireAdmin(req, res);
      if (!user) return;

      const messages = await ContactService.getAll();
      return res.status(200).json({
        data: messages,
      });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
