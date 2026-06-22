"use client";

import { useEffect, useState } from "react";

type Movimento = {
  id: string;
  tipo: string;
  quantidade: number;
  quantidadeAntes: number;
  quantidadeDepois: number;
  nomeSolicitante: string;
  observacao: string | null;
  dataHora: string;
  ferramenta: { codigo: string; descricao: string; posicao: string };
  liberadoPor: { nome: string };
};

const tipoCor: Record<string, string> = {
  SAIDA: "bg-orange-100 text-orange-700",
  RETORNO: "bg-green-100 text-green-700",
  ENTRADA: "bg-blue-100 text-blue-700",
  AJUSTE: "bg-purple-100 text-purple-700",
};

export default function HistoricoPage() {
  const [movimentos, setMovimentos] = useState<Movimento[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({ tipo: "", de: "", ate: "", solicitante: "" });

  async function carregar() {
    setLoading(true);
    const qs = new URLSearchParams();
    if (filtros.tipo) qs.set("tipo", filtros.tipo);
    if (filtros.de) qs.set("de", filtros.de);
    if (filtros.ate) qs.set("ate", filtros.ate);
    if (filtros.solicitante) qs.set("solicitante", filtros.solicitante);

    const res = await fetch(`/api/movimentos?${qs.toString()}`);
    const data = await res.json();
    setMovimentos(data);
    setLoading(false);
  }

  useEffect(() => {
    carregar();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Histórico de Movimentações</h1>
        <p className="text-slate-500">Todas as saídas, retornos, entradas e ajustes</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          carregar();
        }}
        className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm grid grid-cols-1 sm:grid-cols-5 gap-3"
      >
        <select
          value={filtros.tipo}
          onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Todos os tipos</option>
          <option value="SAIDA">Saída</option>
          <option value="RETORNO">Retorno</option>
          <option value="ENTRADA">Entrada</option>
          <option value="AJUSTE">Ajuste</option>
        </select>
        <input
          type="date"
          value={filtros.de}
          onChange={(e) => setFiltros({ ...filtros, de: e.target.value })}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
        />
        <input
          type="date"
          value={filtros.ate}
          onChange={(e) => setFiltros({ ...filtros, ate: e.target.value })}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
        />
        <input
          placeholder="Solicitante"
          value={filtros.solicitante}
          onChange={(e) => setFiltros({ ...filtros, solicitante: e.target.value })}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
        />
        <button type="submit" className="bg-slate-800 hover:bg-slate-700 text-white rounded-lg px-4 py-2 text-sm">
          Filtrar
        </button>
      </form>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-slate-500">
                <th className="py-3 px-4">Data/Hora</th>
                <th className="py-3 px-4">Ferramenta</th>
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4">Qtd</th>
                <th className="py-3 px-4">Antes → Depois</th>
                <th className="py-3 px-4">Solicitante</th>
                <th className="py-3 px-4">Liberado por</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400">Carregando...</td>
                </tr>
              )}
              {!loading && movimentos.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400">Nenhuma movimentação encontrada.</td>
                </tr>
              )}
              {movimentos.map((m) => (
                <tr key={m.id} className="border-t">
                  <td className="py-2 px-4 whitespace-nowrap text-slate-600">
                    {new Date(m.dataHora).toLocaleString("pt-BR")}
                  </td>
                  <td className="py-2 px-4">
                    {m.ferramenta.codigo} - {m.ferramenta.descricao}
                  </td>
                  <td className="py-2 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tipoCor[m.tipo]}`}>
                      {m.tipo}
                    </span>
                  </td>
                  <td className="py-2 px-4">{m.quantidade}</td>
                  <td className="py-2 px-4 text-slate-600">
                    {m.quantidadeAntes} → {m.quantidadeDepois}
                  </td>
                  <td className="py-2 px-4">{m.nomeSolicitante}</td>
                  <td className="py-2 px-4">{m.liberadoPor.nome}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
