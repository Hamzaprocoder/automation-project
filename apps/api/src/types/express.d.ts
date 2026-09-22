import type { OrganizationRole } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email: string; name: string | null };
      organization?: { id: string; name: string };
      membership?: { role: OrganizationRole };
    }
  }
}
export {};
