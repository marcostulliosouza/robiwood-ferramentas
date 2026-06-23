import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcrypt";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const usuarios = await prisma.user.findMany({
    select: { id: true, nome: true, email: true, cargo: true, ativo: true, createdAt: true },
    orderBy: { nome: "asc" },
  });
  return NextResponse.json(usuarios);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if ((session.user as any).cargo !== "ADMIN") {
    return NextResponse.json({ error: "Apenas administradores podem criar usuários." }, { status: 403 });
  }

  const body = await request.json();
  const { nome, email, senha, cargo } = body;

  if (!nome || !email || !senha) {
    return NextResponse.json({ error: "Nome, e-mail e senha são obrigatórios." }, { status: 400 });
  }

  const existente = await prisma.user.findUnique({ where: { email } });
  if (existente) {
    return NextResponse.json({ error: "Já existe um usuário com este e-mail." }, { status: 409 });
  }

  const senhaHash = await bcrypt.hash(senha, 10);
  const usuario = await prisma.user.create({
    data: { nome, email, senha: senhaHash, cargo: cargo || "FUNCIONARIO" },
    select: { id: true, nome: true, email: true, cargo: true, ativo: true },
  });

  return NextResponse.json(usuario, { status: 201 });
}
