import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import EditarFerramentaForm from "./EditarFerramentaForm";

export default async function FerramentaDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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

  if (!ferramenta) notFound();

  const tipoCor: Record<string, string> = {
    SAIDA: "bg-orange-100 text-orange-700",
    RETORNO: "bg-green-100 text-green-700",
    ENTRADA: "bg-blue-100 text-blue-700",
    AJUSTE: "bg-purple-100 text-purple-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{ferramenta.codigo}</h1>
          <p className="text-slate-500">{ferramenta.descricao}</p>
        </div>
        <Link
          href={`/movimentos/novo?ferramentaId=${ferramenta.id}`}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-4 py-2 text-sm"
        >
          + Movimentar
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-slate-500">Posição</p>
          <p className="text-lg font-semibold">{ferramenta.posicao}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-slate-500">Estoque atual</p>
          <p
            className={`text-lg font-semibold ${
              ferramenta.quantidade <= ferramenta.quantidadeMinima ? "text-red-600" : ""
            }`}
          >
            {ferramenta.quantidade}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-slate-500">Estoque mínimo</p>
          <p className="text-lg font-semibold">{ferramenta.quantidadeMinima}</p>
        </div>
      </div>

      <EditarFerramentaForm ferramenta={ferramenta} />

      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-slate-800 mb-3">Histórico desta ferramenta</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b">
                <th className="py-2 pr-4">Data/Hora</th>
                <th className="py-2 pr-4">Tipo</th>
                <th className="py-2 pr-4">Qtd</th>
                <th className="py-2 pr-4">Antes → Depois</th>
                <th className="py-2 pr-4">Solicitante</th>
                <th className="py-2 pr-4">Liberado por</th>
                <th className="py-2 pr-4">Obs.</th>
              </tr>
            </thead>
            <tbody>
              {ferramenta.movimentos.map((m) => (
                <tr key={m.id} className="border-b last:border-0">
                  <td className="py-2 pr-4 whitespace-nowrap text-slate-600">
                    {m.dataHora.toLocaleString("pt-BR")}
                  </td>
                  <td className="py-2 pr-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tipoCor[m.tipo]}`}>
                      {m.tipo}
                    </span>
                  </td>
                  <td className="py-2 pr-4">{m.quantidade}</td>
                  <td className="py-2 pr-4 text-slate-600">
                    {m.quantidadeAntes} → {m.quantidadeDepois}
                  </td>
                  <td className="py-2 pr-4">{m.nomeSolicitante}</td>
                  <td className="py-2 pr-4">{m.liberadoPor.nome}</td>
                  <td className="py-2 pr-4 text-slate-500">{m.observacao}</td>
                </tr>
              ))}
              {ferramenta.movimentos.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-4 text-center text-slate-400">
                    Sem movimentações registradas.
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
