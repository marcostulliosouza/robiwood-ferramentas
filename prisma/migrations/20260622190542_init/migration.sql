-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "cargo" TEXT NOT NULL DEFAULT 'FUNCIONARIO',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Ferramenta" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codigo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "posicao" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 0,
    "quantidadeMinima" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Movimento" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ferramentaId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "quantidadeAntes" INTEGER NOT NULL,
    "quantidadeDepois" INTEGER NOT NULL,
    "nomeSolicitante" TEXT NOT NULL,
    "liberadoPorId" TEXT NOT NULL,
    "observacao" TEXT,
    "dataHora" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Movimento_ferramentaId_fkey" FOREIGN KEY ("ferramentaId") REFERENCES "Ferramenta" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Movimento_liberadoPorId_fkey" FOREIGN KEY ("liberadoPorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Ferramenta_codigo_key" ON "Ferramenta"("codigo");
