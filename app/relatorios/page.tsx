import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function RelatoriosPage() {
  const [porTipo, topSolicitantes, ferramentasMaisMovimentadas, criticas] = await Promise.all([
    prisma.movimento.groupBy({
      by: ["tipo"],
      _sum: { quantidade: true },
      _count: { _all: true },
    }),
    prisma.movimento.groupBy({
      by: ["nomeSolicitante"],
      _count: { _all: true },
      orderBy: { _count: { nomeSolicitante: "desc" } },
      take: 5,
    }),
    prisma.movimento.groupBy({
      by: ["ferramentaId"],
      _count: { _all: true },
      orderBy: { _count: { ferramentaId: "desc" } },
      take: 5,
    }),
    prisma.ferramenta.findMany({ where: { ativo: true } }),
  ]);

  const ferramentasInfo = await prisma.ferramenta.findMany({
    where: { id: { in: ferramentasMaisMovimentadas.map((f) => f.ferramentaId) } },
  });

  const criticasFiltradas = criticas.filter((f) => f.quantidade <= f.quantidadeMinima);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Relatórios</h1>
          <p className="text-slate-500">Indicadores gerais e exportação de dados</p>
        </div>
        <a
          href="/api/relatorios/exportar"
          className="bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg px-4 py-2 text-sm"
        >
          ⬇️ Exportar CSV completo
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {porTipo.map((t) => (
          <div key={t.tipo} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-sm text-slate-500">{t.tipo}</p>
            <p className="text-2xl font-bold text-slate-800">{t._count._all}</p>
            <p className="text-xs text-slate-400">{t._sum.quantidade} unidades</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-3">Top solicitantes</h2>
          <ul className="text-sm space-y-2">
            {topSolicitantes.map((s) => (
              <li key={s.nomeSolicitante} className="flex justify-between border-b last:border-0 pb-2">
                <span>{s.nomeSolicitante}</span>
                <span className="font-medium">{s._count._all} movimentações</span>
              </li>
            ))}
            {topSolicitantes.length === 0 && (
              <li className="text-slate-400">Sem dados ainda.</li>
            )}
          </ul>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-3">Ferramentas mais movimentadas</h2>
          <ul className="text-sm space-y-2">
            {ferramentasMaisMovimentadas.map((f) => {
              const info = ferramentasInfo.find((i) => i.id === f.ferramentaId);
              return (
                <li key={f.ferramentaId} className="flex justify-between border-b last:border-0 pb-2">
                  <Link href={`/ferramentas/${f.ferramentaId}`} className="hover:underline">
                    {info?.codigo} - {info?.descricao}
                  </Link>
                  <span className="font-medium">{f._count._all}x</span>
                </li>
              );
            })}
            {ferramentasMaisMovimentadas.length === 0 && (
              <li className="text-slate-400">Sem dados ainda.</li>
            )}
          </ul>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-slate-800 mb-3">Ferramentas em nível crítico</h2>
        {criticasFiltradas.length === 0 ? (
          <p className="text-sm text-slate-400">Nenhuma ferramenta abaixo do estoque mínimo. 🎉</p>
        ) : (
          <ul className="text-sm space-y-2">
            {criticasFiltradas.map((f) => (
              <li key={f.id} className="flex justify-between border-b last:border-0 pb-2 text-red-600">
                <Link href={`/ferramentas/${f.id}`} className="hover:underline">
                  {f.codigo} - {f.descricao}
                </Link>
                <span>
                  {f.quantidade} / mín. {f.quantidadeMinima}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
