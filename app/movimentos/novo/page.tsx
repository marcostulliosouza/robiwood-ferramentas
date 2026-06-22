"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Ferramenta = {
  id: string;
  codigo: string;
  descricao: string;
  posicao: string;
  quantidade: number;
};

function NovoMovimentoForm() {
  const router = useRouter();
  const params = useSearchParams();
  const ferramentaIdInicial = params.get("ferramentaId") || "";

  const [ferramentas, setFerramentas] = useState<Ferramenta[]>([]);
  const [funcionarios, setFuncionarios] = useState<{ id: string; nome: string }[]>([]);
  const [form, setForm] = useState({
    ferramentaId: ferramentaIdInicial,
    tipo: "SAIDA",
    quantidade: 1,
    nomeSolicitante: "",
    observacao: "",
  });
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/ferramentas")
      .then((r) => r.json())
      .then(setFerramentas);
    fetch("/api/usuarios")
      .then((r) => r.json())
      .then(setFuncionarios);
  }, []);

  async function garantirFuncionarioCadastrado(nome: string) {
    const nomeNormalizado = nome.trim();
    if (!nomeNormalizado) return;
    const existe = funcionarios.some(
      (f) => f.nome.toLowerCase() === nomeNormalizado.toLowerCase()
    );
    if (existe) return;
    try {
      await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: nomeNormalizado, cargo: "FUNCIONARIO" }),
      });
    } catch {
      // se falhar, não impede o registro da movimentação
    }
  }

  const ferramentaSelecionada = ferramentas.find((f) => f.id === form.ferramentaId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setLoading(true);

    await garantirFuncionarioCadastrado(form.nomeSolicitante);

    const res = await fetch("/api/movimentos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setErro(data.error || "Erro ao registrar movimentação.");
      return;
    }

    router.push("/historico");
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Nova Movimentação</h1>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        {erro && <div className="bg-red-50 text-red-600 text-sm rounded-lg px-3 py-2">{erro}</div>}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Ferramenta *</label>
          <select
            required
            value={form.ferramentaId}
            onChange={(e) => setForm({ ...form, ferramentaId: e.target.value })}
            className="w-full border border-slate-300 rounded-lg px-3 py-2"
          >
            <option value="">Selecione...</option>
            {ferramentas.map((f) => (
              <option key={f.id} value={f.id}>
                {f.codigo} - {f.descricao} (estoque: {f.quantidade})
              </option>
            ))}
          </select>
          {ferramentaSelecionada && (
            <p className="text-xs text-slate-500 mt-1">
              Posição: {ferramentaSelecionada.posicao} • Disponível: {ferramentaSelecionada.quantidade}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de movimento *</label>
          <select
            value={form.tipo}
            onChange={(e) => setForm({ ...form, tipo: e.target.value })}
            className="w-full border border-slate-300 rounded-lg px-3 py-2"
          >
            <option value="SAIDA">Saída (retirada por funcionário)</option>
            <option value="RETORNO">Retorno (devolução ao estoque)</option>
            <option value="ENTRADA">Entrada (compra/recebimento)</option>
            <option value="AJUSTE">Ajuste (define quantidade exata)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {form.tipo === "AJUSTE" ? "Nova quantidade total *" : "Quantidade *"}
          </label>
          <input
            type="number"
            min={1}
            required
            value={form.quantidade}
            onChange={(e) => setForm({ ...form, quantidade: Number(e.target.value) })}
            className="w-full border border-slate-300 rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Funcionário solicitante *
          </label>
          <input
            required
            list="funcionarios-cadastrados"
            value={form.nomeSolicitante}
            onChange={(e) => setForm({ ...form, nomeSolicitante: e.target.value })}
            placeholder="Nome de quem está retirando/devolvendo"
            className="w-full border border-slate-300 rounded-lg px-3 py-2"
            autoComplete="off"
          />
          <datalist id="funcionarios-cadastrados">
            {funcionarios.map((f) => (
              <option key={f.id} value={f.nome} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Observação</label>
          <textarea
            value={form.observacao}
            onChange={(e) => setForm({ ...form, observacao: e.target.value })}
            className="w-full border border-slate-300 rounded-lg px-3 py-2"
            rows={2}
          />
        </div>

        <p className="text-xs text-slate-400">
          O usuário logado será registrado automaticamente como responsável pela liberação.
        </p>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium rounded-lg px-4 py-2"
          >
            {loading ? "Registrando..." : "Registrar movimentação"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NovoMovimentoPage() {
  return (
    <Suspense>
      <NovoMovimentoForm />
    </Suspense>
  );
}