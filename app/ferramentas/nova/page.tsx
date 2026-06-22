"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NovaFerramentaPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    codigo: "",
    descricao: "",
    posicao: "",
    quantidade: 0,
    quantidadeMinima: 0,
  });
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setLoading(true);

    const res = await fetch("/api/ferramentas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setErro(data.error || "Erro ao salvar.");
      return;
    }

    router.push("/ferramentas");
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Nova Ferramenta</h1>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        {erro && <div className="bg-red-50 text-red-600 text-sm rounded-lg px-3 py-2">{erro}</div>}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Código *</label>
          <input
            required
            value={form.codigo}
            onChange={(e) => setForm({ ...form, codigo: e.target.value })}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: FE-0012"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Descrição *</label>
          <input
            required
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: Chave de torque 1/2 polegada"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Posição *</label>
          <input
            required
            value={form.posicao}
            onChange={(e) => setForm({ ...form, posicao: e.target.value })}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: Armário A - Gaveta 3"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Quantidade inicial</label>
            <input
              type="number"
              min={0}
              value={form.quantidade}
              onChange={(e) => setForm({ ...form, quantidade: Number(e.target.value) })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Estoque mínimo</label>
            <input
              type="number"
              min={0}
              value={form.quantidadeMinima}
              onChange={(e) => setForm({ ...form, quantidadeMinima: Number(e.target.value) })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium rounded-lg px-4 py-2"
          >
            {loading ? "Salvando..." : "Salvar"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg px-4 py-2"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
