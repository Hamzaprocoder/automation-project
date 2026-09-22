import jwt from "jsonwebtoken";
import type { Response } from "express";

export const COOKIE_NAME = "session";
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be set and at least 32 characters long");
}

export interface SessionPayload {
  userId: string;
  organizationId: string;
  role: string;
}

export const signToken = (payload: SessionPayload) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

export function verifyToken(token: string): SessionPayload | null {
  try { return jwt.verify(token, JWT_SECRET) as SessionPayload; }
  catch { return null; }
}

export function setAuthCookie(res: Response, token: string) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

export function clearAuthCookie(res: Response) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}
