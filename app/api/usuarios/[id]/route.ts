import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if ((session.user as any).cargo !== "ADMIN") {
    return NextResponse.json({ error: "Apenas administradores podem editar usuários." }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const { nome, cargo, ativo } = body;

  const usuario = await prisma.user.update({
    where: { id },
    data: { nome, cargo, ativo },
    select: { id: true, nome: true, email: true, cargo: true, ativo: true },
  });

  return NextResponse.json(usuario);
}
