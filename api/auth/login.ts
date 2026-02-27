import type { VercelRequest, VercelResponse } from "@vercel/node";
import { cors } from "../../lib/cors";
import { AuthServices } from "../../services/auth.services";

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return;
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ message: "method not allowed" });
  }

  const { email, password } = req.body ?? {};

  if (!email || !password) {
    return res.status(400).json({
      message: "email or password are required",
    });
  }

  try {
    const result = await AuthServices.login(email, password);
    return res.status(200).json({
      message: "login success",
      data: result,
    });
  } catch {
    return res.status(401).json({
      message: "invalid email or password",
    });
  }
}
