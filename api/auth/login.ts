
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { cors } from "../../lib/cors";
import { AuthServices } from "../../services/auth.services";

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS and preflight
  if (cors(req, res)) return;
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ message: "method not allowed" });
  }

  let email: string | undefined, password: string | undefined;
  try {
    // Support both JSON and urlencoded body
    if (req.body && typeof req.body === "object") {
      email = req.body.email;
      password = req.body.password;
    } else {
      // fallback: try parse JSON body if string
      if (typeof req.body === "string") {
        try {
          const parsed = JSON.parse(req.body);
          email = parsed.email;
          password = parsed.password;
        } catch {
          // ignore
        }
      }
    }
  } catch (err) {
    console.error("Error parsing body", err);
    return res.status(400).json({ message: "invalid request body" });
  }

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
  } catch (error) {
    console.error("Login error:", error);
    return res.status(401).json({
      message: "invalid email or password",
    });
  }
}
