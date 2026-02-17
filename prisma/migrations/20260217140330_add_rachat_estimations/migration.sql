-- CreateTable
CREATE TABLE "rachat_estimations" (
    "id" TEXT NOT NULL,
    "marque" TEXT NOT NULL,
    "modele" TEXT NOT NULL,
    "version" TEXT,
    "annee" INTEGER NOT NULL,
    "kilometrage" INTEGER NOT NULL,
    "carburant" TEXT NOT NULL,
    "boite" TEXT NOT NULL,
    "couleur" TEXT,
    "puissance" TEXT,
    "etat" TEXT,
    "carnet" TEXT,
    "accident" TEXT,
    "options" TEXT[],
    "commentaire" TEXT,
    "marchePrixMin" INTEGER NOT NULL,
    "marchePrixMax" INTEGER NOT NULL,
    "marchePrixMedian" INTEGER NOT NULL,
    "marcheTendance" TEXT NOT NULL,
    "marcheLiquidite" TEXT NOT NULL,
    "marcheResume" TEXT NOT NULL,
    "rachatPrixMin" INTEGER NOT NULL,
    "rachatPrixMax" INTEGER NOT NULL,
    "rachatPrixConseille" INTEGER NOT NULL,
    "rachatMargeEstimee" TEXT NOT NULL,
    "rachatFraisRemiseEnEtat" INTEGER NOT NULL,
    "rachatExplication" TEXT NOT NULL,
    "vigilance" JSONB NOT NULL,
    "synthese" TEXT NOT NULL,
    "adminId" TEXT,
    "adminName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rachat_estimations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "rachat_estimations_marque_idx" ON "rachat_estimations"("marque");

-- CreateIndex
CREATE INDEX "rachat_estimations_createdAt_idx" ON "rachat_estimations"("createdAt");
