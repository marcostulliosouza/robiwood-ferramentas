"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Ferramenta = {
  id: string;
  codigo: string;
  descricao: string;
  posicao: string;
  quantidade: number;
  quantidadeMinima: number;
  ativo: boolean;
};

export default function FerramentasPage() {
  const [ferramentas, setFerramentas] = useState<Ferramenta[]>([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);

  async function carregar(q = "") {
    setLoading(true);
    const res = await fetch(`/api/ferramentas${q ? `?q=${encodeURIComponent(q)}` : ""}`);
    const data = await res.json();
    setFerramentas(data);
    setLoading(false);
  }

  useEffect(() => {
    carregar();
  }, []);

  function handleBuscaSubmit(e: React.FormEvent) {
    e.preventDefault();
    carregar(busca);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Ferramentas Especiais</h1>
          <p className="text-slate-500">Cadastro e controle de estoque</p>
        </div>
        <Link
          href="/ferramentas/nova"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-4 py-2 text-sm"
        >
          + Nova Ferramenta
        </Link>
      </div>

      <form onSubmit={handleBuscaSubmit} className="flex gap-2">
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por código, descrição ou posição..."
          className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-slate-800 hover:bg-slate-700 text-white rounded-lg px-4 py-2 text-sm"
        >
          Buscar
        </button>
      </form>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-slate-500">
                <th className="py-3 px-4">Código</th>
                <th className="py-3 px-4">Descrição</th>
                <th className="py-3 px-4">Posição</th>
                <th className="py-3 px-4">Qtd.</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    Carregando...
                  </td>
                </tr>
              )}
              {!loading && ferramentas.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    Nenhuma ferramenta encontrada.
                  </td>
                </tr>
              )}
              {ferramentas.map((f) => {
                const critico = f.quantidade <= f.quantidadeMinima;
                return (
                  <tr key={f.id} className="border-t hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-800">{f.codigo}</td>
                    <td className="py-3 px-4">{f.descricao}</td>
                    <td className="py-3 px-4 text-slate-600">{f.posicao}</td>
                    <td className="py-3 px-4">
                      <span className={critico ? "text-red-600 font-semibold" : ""}>
                        {f.quantidade}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {!f.ativo ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                          Inativa
                        </span>
                      ) : critico ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                          Crítico
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                          OK
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/ferramentas/${f.id}`}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Detalhes
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
