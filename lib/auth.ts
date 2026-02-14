import type { VercelRequest, VercelResponse } from "@vercel/node";
import jwt from "jsonwebtoken";

export interface AuthUser {
  id: number;
  role: "admin" | "user";
}

export function verifyToken(req: VercelRequest): AuthUser | null {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.toLowerCase().startsWith("bearer")) {
    return null;
  }

  const token = authHeader.replace(/bearer/i, "").trim();

  if (!token) {
    return null;
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, secret) as AuthUser;
    return decoded;
  } catch {
    return null;
  }
}

export function requireAuth(req: VercelRequest, res: VercelResponse): AuthUser | null {
  const user = verifyToken(req);
  if (!user) {
    res.status(401).json({ message: "unauthorized" });
    return null;
  }
  return user;
}

export function requireAdmin(req: VercelRequest, res: VercelResponse): AuthUser | null {
  const user = requireAuth(req, res);
  if (!user) return null;

  if (user.role !== "admin") {
    res.status(403).json({ message: "admin only" });
    return null;
  }
  return user;
}
