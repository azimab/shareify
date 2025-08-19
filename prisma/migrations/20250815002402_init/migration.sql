-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "spotifyId" TEXT NOT NULL,
    "displayName" TEXT,
    "image" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "friendships" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "friendships_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "friendships_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "weekly_selections" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "weekStart" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "weekly_selections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "track_selections" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "weeklySelectionId" TEXT NOT NULL,
    "spotifyTrackId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "album" TEXT,
    "image" TEXT,
    "uri" TEXT,
    "addedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "track_selections_weeklySelectionId_fkey" FOREIGN KEY ("weeklySelectionId") REFERENCES "weekly_selections" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "weekly_playlists" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "weekStart" DATETIME NOT NULL,
    "spotifyPlaylistId" TEXT,
    "ownerUserId" TEXT NOT NULL,
    "url" TEXT,
    "name" TEXT,
    "description" TEXT,
    "trackCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "weekly_playlists_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_spotifyId_key" ON "users"("spotifyId");

-- CreateIndex
CREATE UNIQUE INDEX "friendships_followerId_followingId_key" ON "friendships"("followerId", "followingId");

-- CreateIndex
CREATE UNIQUE INDEX "weekly_selections_userId_weekStart_key" ON "weekly_selections"("userId", "weekStart");

-- CreateIndex
CREATE UNIQUE INDEX "track_selections_weeklySelectionId_spotifyTrackId_key" ON "track_selections"("weeklySelectionId", "spotifyTrackId");

-- CreateIndex
CREATE UNIQUE INDEX "weekly_playlists_weekStart_ownerUserId_key" ON "weekly_playlists"("weekStart", "ownerUserId");
