-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'ALMOXARIFE', 'FUNCIONARIO');

-- CreateEnum
CREATE TYPE "TipoMovimento" AS ENUM ('SAIDA', 'RETORNO', 'AJUSTE', 'ENTRADA');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "cargo" "Role" NOT NULL DEFAULT 'FUNCIONARIO',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ferramenta" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "posicao" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 0,
    "quantidadeMinima" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ferramenta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Movimento" (
    "id" TEXT NOT NULL,
    "ferramentaId" TEXT NOT NULL,
    "tipo" "TipoMovimento" NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "quantidadeAntes" INTEGER NOT NULL,
    "quantidadeDepois" INTEGER NOT NULL,
    "nomeSolicitante" TEXT NOT NULL,
    "liberadoPorId" TEXT NOT NULL,
    "observacao" TEXT,
    "dataHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Movimento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Ferramenta_codigo_key" ON "Ferramenta"("codigo");

-- AddForeignKey
ALTER TABLE "Movimento" ADD CONSTRAINT "Movimento_ferramentaId_fkey" FOREIGN KEY ("ferramentaId") REFERENCES "Ferramenta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movimento" ADD CONSTRAINT "Movimento_liberadoPorId_fkey" FOREIGN KEY ("liberadoPorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
