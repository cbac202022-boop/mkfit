"use client";

import { subscribeNewsletter } from "@/actions/forms";
import { Button } from "@/components/ui/button";
import { useFormAction } from "@/lib/use-form-action";

export function NewsletterForm() {
  const { state, onSubmit, pending } = useFormAction(subscribeNewsletter);

  if (state.ok) {
    return (
      <p role="status" className="rounded-full bg-accent px-6 py-4 font-bold text-ink">
        {state.message}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="w-full max-w-md">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="newsletter-email" className="sr-only">
          Votre adresse email
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Votre adresse email"
          aria-invalid={state.errors?.email ? true : undefined}
          aria-describedby={state.errors?.email ? "newsletter-error" : undefined}
          className="h-12 flex-1 rounded-full border-0 bg-white px-5 text-ink placeholder:text-ink-500 focus:ring-2 focus:ring-accent"
        />
        <Button type="submit" size="lg" disabled={pending} className="h-12">
          {pending ? "Inscription…" : "Je m'inscris"}
        </Button>
      </div>
      {state.errors?.email && (
        <p id="newsletter-error" role="alert" className="mt-2 text-sm font-medium text-accent">
          {state.errors.email}
        </p>
      )}
    </form>
  );
}
