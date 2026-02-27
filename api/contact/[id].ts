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

  const { id } = req.query;
  const contactId = Number(id);

  if (isNaN(contactId)) {
    return res.status(400).json({ message: "id must be a number" });
  }

  try {
    // GET /api/contact/[id] - Get contact by id (admin only)
    if (req.method === "GET") {
      const user = requireAdmin(req, res);
      if (!user) return;

      const message = await ContactService.getById(contactId);
      if (!message) {
        return res.status(404).json({
          message: "contact message not found",
        });
      }

      return res.status(200).json({
        message: "success to get contact message by id",
        data: message,
      });
    }

    // DELETE /api/contact/[id] - Delete contact (admin only)
    if (req.method === "DELETE") {
      const user = requireAdmin(req, res);
      if (!user) return;

      await ContactService.delete(contactId);
      return res.status(200).json({
        message: "contact message deleted successfully",
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