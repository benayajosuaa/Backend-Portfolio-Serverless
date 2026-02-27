import type { VercelRequest, VercelResponse } from "@vercel/node";
import { cors } from "../../../lib/cors";
import { requireAdmin } from "../../../lib/auth";
import { ContactService } from "../../../services/contact.services";

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

  // POST /api/contact/[id]/reply - Reply to contact (admin only)
  if (req.method === "POST") {
    const user = requireAdmin(req, res);
    if (!user) return;

    try {
      const { markdown } = req.body;

      if (!markdown) {
        return res.status(400).json({
          message: "markdown is required",
        });
      }

      await ContactService.reply(contactId, markdown);

      return res.status(200).json({
        message: "reply has sent successfully",
      });
    } catch (error) {
      console.error("REPLY ERROR:", error);
      return res.status(400).json({
        message: "failed to reply contact message",
        error: String(error),
      });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}