import type { VercelRequest, VercelResponse } from "@vercel/node";
import { cors } from "../lib/cors";

export default function handler(req: VercelRequest, res: VercelResponse) {
  cors(req, res);
  if (req.method === "OPTIONS") return res.status(200).end();
  res.status(404).json({ message: "Not found" });
}