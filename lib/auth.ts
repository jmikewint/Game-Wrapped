import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import type { User } from "@prisma/client";

export async function getCurrentUser(): Promise<User | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;

  return prisma.user.findUnique({ where: { id: userId } });
}
