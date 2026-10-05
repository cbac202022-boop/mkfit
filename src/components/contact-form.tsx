"use client";

import { sendContactMessage } from "@/actions/forms";
import { Button } from "@/components/ui/button";
import { Alert, Field, Select, Textarea, TextField } from "@/components/ui/form";
import { useFormAction } from "@/lib/use-form-action";

export function ContactForm() {
  const { state, onSubmit, pending } = useFormAction(sendContactMessage);

  if (state.ok) return <Alert tone="success">{state.message}</Alert>;

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Nom" name="name" autoComplete="name" required error={state.errors?.name} />
        <TextField label="Email" name="email" type="email" autoComplete="email" required error={state.errors?.email} />
      </div>
      <Field label="Sujet" name="subject" error={state.errors?.subject}>
        <Select id="subject" name="subject" defaultValue="Question sur une commande">
          <option>Question sur une commande</option>
          <option>Question sur un produit</option>
          <option>Retour ou échange</option>
          <option>Partenariat</option>
          <option>Autre</option>
        </Select>
      </Field>
      <Field label="Message" name="message" error={state.errors?.message}>
        <Textarea
          id="message"
          name="message"
          rows={6}
          required
          aria-invalid={state.errors?.message ? true : undefined}
          aria-describedby={state.errors?.message ? "message-error" : undefined}
        />
      </Field>
      <Button type="submit" size="lg" variant="dark" disabled={pending}>
        {pending ? "Envoi…" : "Envoyer le message"}
      </Button>
    </form>
  );
}
