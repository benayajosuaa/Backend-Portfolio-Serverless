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

  const { action } = req.query;

  try {
    if (req.method === "POST" && action === "login") {
      return await login(req, res);
    }

    if (req.method === "POST" && action === "register") {
      return await register(req, res);
    }

    return res.status(404).json({ message: "not found" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "internal server error" });
  }
}

async function login(req: VercelRequest, res: VercelResponse) {
  const { email, password } = req.body;

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

async function register(req: VercelRequest, res: VercelResponse) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "email or password are required",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      message: "password must be at least 6 characters",
    });
  }

  try {
    const user = await AuthServices.register(email, password);

    return res.status(201).json({
      message: "register success",
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error(error);

    if (error.code === "P2002") {
      return res.status(409).json({
        message: "email already registered",
      });
    }

    return res.status(400).json({
      message: "register failed",
    });
  }
}