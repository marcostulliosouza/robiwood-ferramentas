import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { auth, handlers, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },

  providers: [
    Credentials({
      credentials: {
        email: {},
        senha: {},
      },

      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials?.email as string },
        });

        if (!user) return null;

        const ok = await bcrypt.compare(
          credentials?.senha as string,
          user.senha
        );

        if (!ok) return null;

        return {
          id: user.id,
          name: user.nome,
          email: user.email,
          cargo: user.cargo,
        };
      },
    }),
  ],
});