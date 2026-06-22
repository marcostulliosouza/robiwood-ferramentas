"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { FiTool, FiLogOut } from "react-icons/fi";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/ferramentas", label: "Ferramentas" },
  { href: "/movimentos/novo", label: "Nova Movimentação" },
  { href: "/historico", label: "Histórico" },
  { href: "/relatorios", label: "Relatórios" },
  { href: "/usuarios", label: "Usuários" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (pathname === "/login") return null;

  return (
    <header className="bg-slate-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-6 flex-wrap">
          <span className="font-bold text-lg whitespace-nowrap flex items-center gap-2">
            <FiTool /> Oficina Robi Wood
          </span>
          <nav className="flex gap-1 flex-wrap">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`text-sm px-3 py-1.5 rounded-lg transition ${
                  pathname === l.href
                    ? "bg-blue-600 text-white"
                    : "text-slate-200 hover:bg-slate-700"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-slate-300">
            {session?.user?.name}{" "}
            <span className="text-slate-500">
              ({(session?.user as any)?.cargo})
            </span>
          </span>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-lg"
          >
            <FiLogOut size={14} /> Sair
          </button>
        </div>
      </div>
    </header>
  );
}