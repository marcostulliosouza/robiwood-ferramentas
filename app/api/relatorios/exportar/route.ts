import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

function csvEscape(value: unknown) {
  const s = String(value ?? "");
  if (/[",;\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const de = searchParams.get("de");
  const ate = searchParams.get("ate");
  const tipo = searchParams.get("tipo") || undefined;

  const movimentos = await prisma.movimento.findMany({
    where: {
      tipo: tipo as any,
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
  });

  const header = [
    "Data/Hora",
    "Código",
    "Descrição",
    "Posição",
    "Tipo",
    "Quantidade",
    "Qtd Antes",
    "Qtd Depois",
    "Solicitante",
    "Liberado Por",
    "Observação",
  ];

  const linhas = movimentos.map((m) =>
    [
      m.dataHora.toLocaleString("pt-BR"),
      m.ferramenta.codigo,
      m.ferramenta.descricao,
      m.ferramenta.posicao,
      m.tipo,
      m.quantidade,
      m.quantidadeAntes,
      m.quantidadeDepois,
      m.nomeSolicitante,
      m.liberadoPor.nome,
      m.observacao || "",
    ]
      .map(csvEscape)
      .join(";")
  );

  const csv = [header.join(";"), ...linhas].join("\n");
  const bom = "\uFEFF"; // garante acentuação correta no Excel

  return new NextResponse(bom + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="relatorio-movimentacoes.csv"`,
    },
  });
}
