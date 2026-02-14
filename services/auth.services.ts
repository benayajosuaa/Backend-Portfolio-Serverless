import { getPrisma } from "../lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const AuthServices = {
  async login(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await getPrisma().users.findFirst({
      where: {
        email: {
          equals: normalizedEmail,
          mode: "insensitive",
        },
      },
    });
    if (!user) throw new Error("invalid");

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) throw new Error("invalid");

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  },

  async register(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const hashedPassword = await bcrypt.hash(password, 10);
    return getPrisma().users.create({
      data: {
        email: normalizedEmail,
        password_hash: hashedPassword,
        role: "user",
      },
    });
  },
};
