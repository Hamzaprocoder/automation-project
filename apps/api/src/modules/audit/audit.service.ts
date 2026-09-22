import { prisma } from "../../lib/prisma";

interface LogInput {
  organizationId: string;
  userId?: string | null;
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

export async function log(data: LogInput) {
  return prisma.auditLog.create({
    data: {
      organizationId: data.organizationId,
      actorId: data.userId ?? null,
      action: data.action,
      entityType: data.entityType ?? "System",
      entityId: data.entityId,
      metadata: data.metadata ?? {},
    },
  });
}

export async function listLogs(
  organizationId: string,
  options: { page?: number; limit?: number; action?: string; userId?: string } = {},
) {
  const page = Math.max(options.page ?? 1, 1);
  const limit = Math.min(Math.max(options.limit ?? 30, 1), 100);
  const skip = (page - 1) * limit;

  const where = {
    organizationId,
    ...(options.action ? { action: options.action } : {}),
    ...(options.userId ? { actorId: options.userId } : {}),
  };

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: { actor: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { data: logs, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
}
