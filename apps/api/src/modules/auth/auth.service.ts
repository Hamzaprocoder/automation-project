import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { signToken } from "../../lib/auth";
import type { LoginInput, RegisterInput } from "./auth.schema";

function generateSlug(name: string) {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "organization";
  return `${base}-${Date.now().toString(36)}`;
}

export async function registerUser(input: RegisterInput) {
  const email = input.email.toLowerCase();
  if (await prisma.user.findUnique({ where: { email } })) throw new Error("Email already registered");

  const passwordHash = await bcrypt.hash(input.password, 12);
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({ data: { name: input.name, email, passwordHash } });
    const organization = await tx.organization.create({
      data: { name: input.organizationName, slug: generateSlug(input.organizationName) },
    });
    const membership = await tx.organizationMember.create({
      data: { userId: user.id, organizationId: organization.id, role: "OWNER" },
    });
    return { user, organization, membership };
  });

  return {
    token: signToken({
      userId: result.user.id,
      organizationId: result.organization.id,
      role: result.membership.role,
    }),
    user: { id: result.user.id, name: result.user.name, email: result.user.email },
    organization: {
      id: result.organization.id,
      name: result.organization.name,
      slug: result.organization.slug,
    },
    role: result.membership.role,
  };
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
    include: { memberships: { include: { organization: true }, orderBy: { createdAt: "asc" }, take: 1 } },
  });

  if (!user?.passwordHash || !(await bcrypt.compare(input.password, user.passwordHash))) {
    throw new Error("Invalid email or password");
  }

  const membership = user.memberships[0];
  if (!membership) throw new Error("Invalid email or password");

  return {
    token: signToken({
      userId: user.id,
      organizationId: membership.organizationId,
      role: membership.role,
    }),
    user: { id: user.id, name: user.name, email: user.email },
    organization: {
      id: membership.organization.id,
      name: membership.organization.name,
      slug: membership.organization.slug,
    },
    role: membership.role,
  };
}
