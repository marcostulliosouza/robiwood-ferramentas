import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function DashboardPage() {
  const [totalFerramentas, totalUnidades, todasFerramentas, ultimosMovimentos] =
    await Promise.all([
      prisma.ferramenta.count({ where: { ativo: true } }),
      prisma.ferramenta.aggregate({ _sum: { quantidade: true } }),
      prisma.ferramenta.findMany({ where: { ativo: true } }),
      prisma.movimento.findMany({
        take: 8,
        orderBy: { dataHora: "desc" },
        include: {
          ferramenta: { select: { codigo: true, descricao: true } },
          liberadoPor: { select: { nome: true } },
        },
      }),
    ]);

  const criticas = todasFerramentas.filter((f) => f.quantidade <= f.quantidadeMinima);

  const cards = [
    { label: "Ferramentas cadastradas", valor: totalFerramentas },
    { label: "Unidades em estoque", valor: totalUnidades._sum.quantidade || 0 },
    { label: "Itens em nível crítico", valor: criticas.length, alerta: criticas.length > 0 },
  ];

  const tipoCor: Record<string, string> = {
    SAIDA: "bg-orange-100 text-orange-700",
    RETORNO: "bg-green-100 text-green-700",
    ENTRADA: "bg-blue-100 text-blue-700",
    AJUSTE: "bg-purple-100 text-purple-700",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500">Visão geral do controle de ferramentas especiais</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className={`rounded-2xl border p-5 shadow-sm ${c.alerta ? "bg-red-50 border-red-200" : "bg-white border-slate-200"
              }`}
          >
            <p className="text-sm text-slate-500">{c.label}</p>
            <p className={`text-3xl font-bold ${c.alerta ? "text-red-600" : "text-slate-800"}`}>
              {c.valor}
            </p>
          </div>
        ))}
      </div>

      {criticas.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
          <h2 className="font-semibold text-red-700 mb-2">⚠️ Itens em nível crítico</h2>
          <ul className="text-sm text-red-700 space-y-1">
            {criticas.map((f) => (
              <li key={f.id}>
                <Link href={`/ferramentas/${f.id}`} className="underline hover:text-red-900">
                  {f.codigo} — {f.descricao}
                </Link>{" "}
                (estoque: {f.quantidade}, mínimo: {f.quantidadeMinima})
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-800">Últimas movimentações</h2>
          <Link href="/historico" className="text-sm text-blue-600 hover:underline">
            Ver histórico completo →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b">
                <th className="py-2 pr-4">Data/Hora</th>
                <th className="py-2 pr-4">Ferramenta</th>
                <th className="py-2 pr-4">Tipo</th>
                <th className="py-2 pr-4">Qtd</th>
                <th className="py-2 pr-4">Solicitante</th>
                <th className="py-2 pr-4">Liberado por</th>
              </tr>
            </thead>
            <tbody>
              {ultimosMovimentos.map((m) => (
                <tr key={m.id} className="border-b last:border-0">
                  <td className="py-2 pr-4 whitespace-nowrap text-slate-600">
                    {m.dataHora.toLocaleString("pt-BR")}
                  </td>
                  <td className="py-2 pr-4">
                    {m.ferramenta.codigo} - {m.ferramenta.descricao}
                  </td>
                  <td className="py-2 pr-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tipoCor[m.tipo]}`}>
                      {m.tipo}
                    </span>
                  </td>
                  <td className="py-2 pr-4">{m.quantidade}</td>
                  <td className="py-2 pr-4">{m.nomeSolicitante}</td>
                  <td className="py-2 pr-4">{m.liberadoPor.nome}</td>
                </tr>
              ))}
              {ultimosMovimentos.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-slate-400">
                    Nenhuma movimentação registrada ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
