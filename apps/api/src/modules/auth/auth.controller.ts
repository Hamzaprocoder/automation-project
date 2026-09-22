import type { Request, Response } from "express";
import { clearAuthCookie, setAuthCookie } from "../../lib/auth";
import { loginSchema, registerSchema } from "./auth.schema";
import * as authService from "./auth.service";
import { log as auditLog } from "../audit/audit.service";

export async function register(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten().fieldErrors });
  try {
    const result = await authService.registerUser(parsed.data);
    setAuthCookie(res, result.token);
    return res.status(201).json({ message: "Registration successful", user: result.user, organization: result.organization, role: result.role });
  } catch (error) {
    if (error instanceof Error && error.message === "Email already registered") return res.status(409).json({ error: error.message });
    console.error("Register error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten().fieldErrors });
  try {
    const result = await authService.loginUser(parsed.data);
    setAuthCookie(res, result.token);
    await auditLog({ organizationId: result.organization.id, userId: result.user.id, action: "user.login", entityType: "User", entityId: result.user.id, metadata: { email: result.user.email } });
    return res.status(200).json({ message: "Login successful", user: result.user, organization: result.organization, role: result.role });
  } catch {
    return res.status(401).json({ error: "Invalid email or password" });
  }
}

export function logout(_req: Request, res: Response) {
  clearAuthCookie(res);
  return res.status(200).json({ message: "Logged out successfully" });
}

export function me(req: Request, res: Response) {
  return res.status(200).json({ user: req.user, organization: req.organization, role: req.membership?.role });
}
