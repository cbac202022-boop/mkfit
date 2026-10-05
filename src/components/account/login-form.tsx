"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Alert, TextField } from "@/components/ui/form";

/** N'accepte que des chemins internes pour éviter les redirections ouvertes. */
export function safeCallback(url: string | undefined, fallback = "/compte") {
  return url && url.startsWith("/") && !url.startsWith("//") ? url : fallback;
}

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const data = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: data.get("email"),
      password: data.get("password"),
      redirect: false,
    });
    setPending(false);
    if (!res || res.error) {
      setError("Email ou mot de passe incorrect.");
      return;
    }
    router.push(safeCallback(callbackUrl));
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error && <Alert tone="error">{error}</Alert>}
      <TextField label="Adresse email" name="email" type="email" autoComplete="email" required />
      <TextField label="Mot de passe" name="password" type="password" autoComplete="current-password" required />
      <Button type="submit" size="lg" variant="dark" className="w-full" disabled={pending}>
        {pending ? "Connexion…" : "Se connecter"}
      </Button>
      <p className="text-center text-sm">
        Pas encore de compte ?{" "}
        <Link
          href={`/compte/inscription${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
          className="font-bold underline underline-offset-4"
        >
          Créer un compte
        </Link>
      </p>
    </form>
  );
}
