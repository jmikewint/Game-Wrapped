-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "steamId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "profileUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "games" (
    "id" TEXT NOT NULL,
    "steamAppId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "headerImage" TEXT,
    "genres" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "owned_games" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "playtimeForever" INTEGER NOT NULL DEFAULT 0,
    "playtimeTwoWeeks" INTEGER NOT NULL DEFAULT 0,
    "lastPlayedAt" TIMESTAMP(3),

    CONSTRAINT "owned_games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "play_snapshots" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "playtimeTotal" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "play_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recaps" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "totalMinutes" INTEGER NOT NULL DEFAULT 0,
    "topGameId" TEXT,
    "shareSlug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recaps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_steamId_key" ON "users"("steamId");

-- CreateIndex
CREATE UNIQUE INDEX "games_steamAppId_key" ON "games"("steamAppId");

-- CreateIndex
CREATE UNIQUE INDEX "owned_games_userId_gameId_key" ON "owned_games"("userId", "gameId");

-- CreateIndex
CREATE INDEX "play_snapshots_userId_capturedAt_idx" ON "play_snapshots"("userId", "capturedAt");

-- CreateIndex
CREATE UNIQUE INDEX "recaps_shareSlug_key" ON "recaps"("shareSlug");

-- CreateIndex
CREATE UNIQUE INDEX "recaps_userId_year_key" ON "recaps"("userId", "year");

-- AddForeignKey
ALTER TABLE "owned_games" ADD CONSTRAINT "owned_games_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "owned_games" ADD CONSTRAINT "owned_games_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "play_snapshots" ADD CONSTRAINT "play_snapshots_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "play_snapshots" ADD CONSTRAINT "play_snapshots_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recaps" ADD CONSTRAINT "recaps_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
