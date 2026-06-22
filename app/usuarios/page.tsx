"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type Usuario = {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  ativo: boolean;
};

export default function UsuariosPage() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.cargo === "ADMIN";

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [form, setForm] = useState({ nome: "", email: "", senha: "", cargo: "FUNCIONARIO" });
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  async function carregar() {
    const res = await fetch("/api/usuarios");
    if (res.ok) setUsuarios(await res.json());
  }

  useEffect(() => {
    carregar();
  }, []);

  async function criar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setLoading(true);
    const res = await fetch("/api/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setErro(data.error || "Erro ao criar usuário.");
      return;
    }
    setForm({ nome: "", email: "", senha: "", cargo: "FUNCIONARIO" });
    carregar();
  }

  async function alternarAtivo(u: Usuario) {
    await fetch(`/api/usuarios/${u.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: u.nome, cargo: u.cargo, ativo: !u.ativo }),
    });
    carregar();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Usuários do Sistema</h1>
        <p className="text-slate-500">
          Quem pode liberar movimentações de ferramentas (login obrigatório)
        </p>
      </div>

      {isAdmin && (
        <form onSubmit={criar} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
          {erro && <div className="sm:col-span-5 bg-red-50 text-red-600 text-sm rounded-lg px-3 py-2">{erro}</div>}
          <input
            required
            placeholder="Nome"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />
          <input
            required
            type="email"
            placeholder="E-mail"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />
          <input
            required
            type="password"
            placeholder="Senha"
            value={form.senha}
            onChange={(e) => setForm({ ...form, senha: e.target.value })}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />
          <select
            value={form.cargo}
            onChange={(e) => setForm({ ...form, cargo: e.target.value })}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="FUNCIONARIO">Funcionário</option>
            <option value="ALMOXARIFE">Almoxarife</option>
            <option value="ADMIN">Administrador</option>
          </select>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg px-4 py-2 text-sm"
          >
            {loading ? "Criando..." : "+ Criar usuário"}
          </button>
        </form>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-slate-500">
                <th className="py-3 px-4">Nome</th>
                <th className="py-3 px-4">E-mail</th>
                <th className="py-3 px-4">Cargo</th>
                <th className="py-3 px-4">Status</th>
                {isAdmin && <th className="py-3 px-4"></th>}
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="py-2 px-4 font-medium">{u.nome}</td>
                  <td className="py-2 px-4 text-slate-600">{u.email}</td>
                  <td className="py-2 px-4">{u.cargo}</td>
                  <td className="py-2 px-4">
                    {u.ativo ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Ativo</span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">Inativo</span>
                    )}
                  </td>
                  {isAdmin && (
                    <td className="py-2 px-4 text-right">
                      <button
                        onClick={() => alternarAtivo(u)}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        {u.ativo ? "Desativar" : "Ativar"}
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
