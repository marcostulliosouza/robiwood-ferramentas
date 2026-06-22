"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EditarFerramentaForm({ ferramenta }: { ferramenta: any }) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({
    codigo: ferramenta.codigo,
    descricao: ferramenta.descricao,
    posicao: ferramenta.posicao,
    quantidadeMinima: ferramenta.quantidadeMinima,
    ativo: ferramenta.ativo,
  });
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErro("");
    const res = await fetch(`/api/ferramentas/${ferramenta.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setErro(data.error || "Erro ao salvar.");
      return;
    }
    setEditando(false);
    router.refresh();
  }

  async function excluir() {
    if (!confirm("Tem certeza que deseja excluir esta ferramenta e todo seu histórico?")) return;
    const res = await fetch(`/api/ferramentas/${ferramenta.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/ferramentas");
    } else {
      const data = await res.json();
      alert(data.error || "Erro ao excluir.");
    }
  }

  if (!editando) {
    return (
      <div className="flex gap-3">
        <button
          onClick={() => setEditando(true)}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg px-4 py-2 text-sm"
        >
          Editar cadastro
        </button>
        <button
          onClick={excluir}
          className="bg-red-50 hover:bg-red-100 text-red-600 rounded-lg px-4 py-2 text-sm"
        >
          Excluir ferramenta
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={salvar} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
      {erro && <div className="bg-red-50 text-red-600 text-sm rounded-lg px-3 py-2">{erro}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Código</label>
          <input
            value={form.codigo}
            onChange={(e) => setForm({ ...form, codigo: e.target.value })}
            className="w-full border border-slate-300 rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Posição</label>
          <input
            value={form.posicao}
            onChange={(e) => setForm({ ...form, posicao: e.target.value })}
            className="w-full border border-slate-300 rounded-lg px-3 py-2"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
        <input
          value={form.descricao}
          onChange={(e) => setForm({ ...form, descricao: e.target.value })}
          className="w-full border border-slate-300 rounded-lg px-3 py-2"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Estoque mínimo</label>
          <input
            type="number"
            min={0}
            value={form.quantidadeMinima}
            onChange={(e) => setForm({ ...form, quantidadeMinima: Number(e.target.value) })}
            className="w-full border border-slate-300 rounded-lg px-3 py-2"
          />
        </div>
        <div className="flex items-center gap-2 pt-6">
          <input
            id="ativo"
            type="checkbox"
            checked={form.ativo}
            onChange={(e) => setForm({ ...form, ativo: e.target.checked })}
          />
          <label htmlFor="ativo" className="text-sm text-slate-700">
            Ferramenta ativa
          </label>
        </div>
      </div>
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg px-4 py-2 text-sm"
        >
          {loading ? "Salvando..." : "Salvar alterações"}
        </button>
        <button
          type="button"
          onClick={() => setEditando(false)}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg px-4 py-2 text-sm"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
