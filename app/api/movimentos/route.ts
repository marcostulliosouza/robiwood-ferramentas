import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const ferramentaId = searchParams.get("ferramentaId") || undefined;
  const tipo = searchParams.get("tipo") || undefined;
  const de = searchParams.get("de");
  const ate = searchParams.get("ate");
  const solicitante = searchParams.get("solicitante") || undefined;

  const movimentos = await prisma.movimento.findMany({
    where: {
      ferramentaId,
      tipo: tipo as any,
      nomeSolicitante: solicitante
        ? { contains: solicitante }
        : undefined,
      dataHora: {
        gte: de ? new Date(de) : undefined,
        lte: ate ? new Date(ate + "T23:59:59") : undefined,
      },
    },
    include: {
      ferramenta: { select: { codigo: true, descricao: true, posicao: true } },
      liberadoPor: { select: { nome: true } },
    },
    orderBy: { dataHora: "desc" },
    take: 500,
  });

  return NextResponse.json(movimentos);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await request.json();
  const { ferramentaId, tipo, quantidade, nomeSolicitante, observacao } = body;

  if (!ferramentaId || !tipo || !quantidade || !nomeSolicitante) {
    return NextResponse.json(
      { error: "Ferramenta, tipo, quantidade e solicitante são obrigatórios." },
      { status: 400 }
    );
  }

  const qtd = Number(quantidade);
  if (qtd <= 0) {
    return NextResponse.json({ error: "Quantidade deve ser maior que zero." }, { status: 400 });
  }

  const ferramenta = await prisma.ferramenta.findUnique({ where: { id: ferramentaId } });
  if (!ferramenta) return NextResponse.json({ error: "Ferramenta não encontrada." }, { status: 404 });

  let quantidadeDepois = ferramenta.quantidade;
  if (tipo === "SAIDA") {
    if (qtd > ferramenta.quantidade) {
      return NextResponse.json(
        { error: `Quantidade insuficiente em estoque (disponível: ${ferramenta.quantidade}).` },
        { status: 400 }
      );
    }
    quantidadeDepois = ferramenta.quantidade - qtd;
  } else if (tipo === "RETORNO" || tipo === "ENTRADA") {
    quantidadeDepois = ferramenta.quantidade + qtd;
  } else if (tipo === "AJUSTE") {
    quantidadeDepois = qtd; // ajuste define a quantidade absoluta
  } else {
    return NextResponse.json({ error: "Tipo de movimento inválido." }, { status: 400 });
  }

  const [movimento] = await prisma.$transaction([
    prisma.movimento.create({
      data: {
        ferramentaId,
        tipo,
        quantidade: tipo === "AJUSTE" ? Math.abs(quantidadeDepois - ferramenta.quantidade) : qtd,
        quantidadeAntes: ferramenta.quantidade,
        quantidadeDepois,
        nomeSolicitante,
        liberadoPorId: (session.user as any).id,
        observacao,
      },
    }),
    prisma.ferramenta.update({
      where: { id: ferramentaId },
      data: { quantidade: quantidadeDepois },
    }),
  ]);

  return NextResponse.json(movimento, { status: 201 });
}
