"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FiTool } from "react-icons/fi";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/";
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      senha,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setErro("E-mail ou senha inválidos.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-sm space-y-4"
      >
        <div className="text-center mb-2">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-3">
            <FiTool size={22} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Oficina Robi Wood</h1>
          <p className="text-sm text-slate-500">Controle de Ferramentas Especiais</p>
        </div>

        {erro && (
          <div className="bg-red-50 text-red-600 text-sm rounded-lg px-3 py-2">
            {erro}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            E-mail
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="seuemail@gmail.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Senha
          </label>
          <input
            type="password"
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium rounded-lg py-2 transition"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}