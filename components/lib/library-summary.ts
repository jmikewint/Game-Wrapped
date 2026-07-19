import { prisma } from "@/lib/prisma";

export type LibrarySummary = {
  gameCount: number;
  totalHours: number;
  topGame: { name: string; hours: number } | null;
};

export async function getLibrarySummary(userId: string): Promise<LibrarySummary> {
  const ownedGames = await prisma.ownedGame.findMany({
    where: { userId },
    include: { game: true },
    orderBy: { playtimeForever: "desc" },
  });

  const totalMinutes = ownedGames.reduce(
    (sum, owned) => sum + owned.playtimeForever,
    0,
  );
  const top = ownedGames[0];

  return {
    gameCount: ownedGames.length,
    totalHours: Math.round(totalMinutes / 60),
    topGame: top
      ? { name: top.game.name, hours: Math.round(top.playtimeForever / 60) }
      : null,
  };
}
