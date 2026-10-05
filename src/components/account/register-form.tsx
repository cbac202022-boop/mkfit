"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { registerUser } from "@/actions/account";
import { safeCallback } from "@/components/account/login-form";
import { Button } from "@/components/ui/button";
import { Alert, TextField } from "@/components/ui/form";
import { useFormAction } from "@/lib/use-form-action";

export function RegisterForm({ callbackUrl }: { callbackUrl?: string }) {
  const router = useRouter();
  const credentials = useRef<{ email: string; password: string } | null>(null);
  const { state, onSubmit, pending } = useFormAction(registerUser, (formData) => {
    credentials.current = {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    };
  });

  // Compte créé : connexion automatique
  useEffect(() => {
    if (!state.ok || !credentials.current) return;
    signIn("credentials", { ...credentials.current, redirect: false }).then(() => {
      router.push(safeCallback(callbackUrl));
      router.refresh();
    });
  }, [state.ok, callbackUrl, router]);

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      {state.message && <Alert tone="error">{state.message}</Alert>}
      <TextField label="Nom complet" name="name" autoComplete="name" required error={state.errors?.name} />
      <TextField label="Adresse email" name="email" type="email" autoComplete="email" required error={state.errors?.email} />
      <TextField
        label="Mot de passe"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        hint="8 caractères minimum, dont au moins un chiffre."
        error={state.errors?.password}
      />
      <TextField
        label="Confirmer le mot de passe"
        name="confirm"
        type="password"
        autoComplete="new-password"
        required
        error={state.errors?.confirm}
      />
      <Button type="submit" size="lg" variant="dark" className="w-full" disabled={pending || state.ok}>
        {pending || state.ok ? "Création du compte…" : "Créer mon compte"}
      </Button>
      <p className="text-center text-sm">
        Déjà inscrit ?{" "}
        <Link href="/compte/connexion" className="font-bold underline underline-offset-4">
          Se connecter
        </Link>
      </p>
    </form>
  );
}
