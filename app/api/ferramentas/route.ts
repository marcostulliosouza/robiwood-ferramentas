import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const busca = searchParams.get("q")?.trim();

  const ferramentas = await prisma.ferramenta.findMany({
    where: busca
      ? {
          OR: [
            { codigo: { contains: busca } },
            { descricao: { contains: busca } },
            { posicao: { contains: busca } },
          ],
        }
      : undefined,
    orderBy: { codigo: "asc" },
  });

  return NextResponse.json(ferramentas);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await request.json();
  const { codigo, descricao, posicao, quantidade, quantidadeMinima } = body;

  if (!codigo || !descricao || !posicao) {
    return NextResponse.json(
      { error: "Código, descrição e posição são obrigatórios." },
      { status: 400 }
    );
  }

  const existente = await prisma.ferramenta.findUnique({ where: { codigo } });
  if (existente) {
    return NextResponse.json(
      { error: "Já existe uma ferramenta com este código." },
      { status: 409 }
    );
  }

  const ferramenta = await prisma.ferramenta.create({
    data: {
      codigo,
      descricao,
      posicao,
      quantidade: Number(quantidade) || 0,
      quantidadeMinima: Number(quantidadeMinima) || 0,
    },
  });

  if (ferramenta.quantidade > 0) {
    await prisma.movimento.create({
      data: {
        ferramentaId: ferramenta.id,
        tipo: "ENTRADA",
        quantidade: ferramenta.quantidade,
        quantidadeAntes: 0,
        quantidadeDepois: ferramenta.quantidade,
        nomeSolicitante: "Cadastro inicial",
        liberadoPorId: (session.user as any).id,
        observacao: "Cadastro inicial da ferramenta",
      },
    });
  }

  return NextResponse.json(ferramenta, { status: 201 });
}
