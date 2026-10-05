import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/compte/connexion" },
  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
        if (!user) return null;
        const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!ok) return null;
        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
  },
};

/**
 * Session côté serveur, vérifiée en base (une fois par requête grâce à cache()) :
 * un compte supprimé n'est plus considéré comme connecté et le rôle est toujours à jour.
 */
export const getSession = cache(async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true, name: true } });
  if (!user) return null;
  session.user.role = user.role;
  session.user.name = user.name;
  return session;
});

/** Retourne l'utilisateur connecté, ou redirige vers la connexion. */
export async function requireUser(callbackUrl = "/compte") {
  const session = await getSession();
  if (!session?.user) redirect(`/compte/connexion?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  return session.user;
}

/** Vérifie le rôle administrateur (appelé dans chaque page et action admin, en plus du middleware). */
export async function requireAdmin() {
  const session = await getSession();
  if (!session?.user) redirect("/compte/connexion?callbackUrl=/admin");
  if (session.user.role !== "ADMIN") redirect("/");
  return session.user;
}
