import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await params;
  const ferramenta = await prisma.ferramenta.findUnique({
    where: { id },
    include: {
      movimentos: {
        orderBy: { dataHora: "desc" },
        include: { liberadoPor: { select: { nome: true } } },
      },
    },
  });

  if (!ferramenta) return NextResponse.json({ error: "Não encontrada" }, { status: 404 });
  return NextResponse.json(ferramenta);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const { codigo, descricao, posicao, quantidadeMinima, ativo } = body;

  const ferramenta = await prisma.ferramenta.update({
    where: { id },
    data: { codigo, descricao, posicao, quantidadeMinima: Number(quantidadeMinima), ativo },
  });

  return NextResponse.json(ferramenta);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if ((session.user as any).cargo !== "ADMIN") {
    return NextResponse.json({ error: "Apenas administradores podem excluir." }, { status: 403 });
  }

  const { id } = await params;
  await prisma.movimento.deleteMany({ where: { ferramentaId: id } });
  await prisma.ferramenta.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
