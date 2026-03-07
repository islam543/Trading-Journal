-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "googleId" TEXT,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- Create a placeholder user for existing trades
INSERT INTO "User" ("email", "name") VALUES ('legacy@tradingjournal.local', 'Legacy User');

-- Add userId as nullable first
ALTER TABLE "Trade" ADD COLUMN "userId" INTEGER;

-- Backfill existing trades to the placeholder user
UPDATE "Trade" SET "userId" = (SELECT "id" FROM "User" WHERE "email" = 'legacy@tradingjournal.local');

-- Now make it required
ALTER TABLE "Trade" ALTER COLUMN "userId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
