import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Credenciais",
      credentials: {
        email: { label: "E-mail", type: "email" },
        senha: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const senha = credentials?.senha as string | undefined;
        if (!email || !senha) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.ativo || !user.senha) return null;

        const senhaOk = await bcrypt.compare(senha, user.senha);
        if (!senhaOk) return null;

        return {
          id: user.id,
          name: user.nome,
          email: user.email,
          cargo: user.cargo,
        } as any;
      },
    }),
  ],
});
