import type { VercelRequest, VercelResponse } from "@vercel/node";
import { cors } from "../../../lib/cors";
import { requireAdmin } from "../../../lib/auth";
import { ContactService } from "../../../services/contact.services";

export const config = {
  api: {
    bodyParser: true,
  },
};

const validStatuses = ["Unread", "Read", "Replied", "Archived"];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS and preflight
  if (cors(req, res)) return;
  if (req.method === "OPTIONS") return res.status(200).end();

  const { id } = req.query;
  const contactId = Number(id);

  if (isNaN(contactId)) {
    return res.status(400).json({ message: "id must be a number" });
  }

  // PUT /api/contact/[id]/status - Update status (admin only)
  if (req.method === "PUT") {
    const user = requireAdmin(req, res);
    if (!user) return;

    try {
      const { status } = req.body;

      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({
          message: "invalid status",
        });
      }

      await ContactService.updateStatus(
        contactId,
        status as "Unread" | "Read" | "Replied" | "Archived"
      );

      return res.status(200).json({
        message: "status updated successfully",
      });
    } catch (error) {
      console.error(error);
      return res.status(400).json({
        message: "failed to update status",
      });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}