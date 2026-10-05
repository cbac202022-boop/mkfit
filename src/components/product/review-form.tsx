"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { addReview } from "@/actions/reviews";
import { Button } from "@/components/ui/button";
import { Alert, Field, FieldError, Textarea, TextField } from "@/components/ui/form";
import { useFormAction } from "@/lib/use-form-action";
import { cn } from "@/lib/utils";

export function ReviewForm({ productId, existing }: { productId: string; existing?: { rating: number; title: string; comment: string } }) {
  const { state, onSubmit, pending } = useFormAction(addReview);
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [hover, setHover] = useState(0);

  if (state.ok) return <Alert tone="success">{state.message}</Alert>;

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <input type="hidden" name="productId" value={productId} />
      {state.message && <Alert tone="error">{state.message}</Alert>}

      <fieldset>
        <legend className="mb-1.5 text-sm font-semibold">Votre note</legend>
        <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="cursor-pointer" onMouseEnter={() => setHover(n)}>
              <input
                type="radio"
                name="rating"
                value={n}
                checked={rating === n}
                onChange={() => setRating(n)}
                className="peer sr-only"
              />
              <span className="sr-only">
                {n} étoile{n > 1 ? "s" : ""}
              </span>
              <Star
                aria-hidden="true"
                className={cn(
                  "h-8 w-8 rounded peer-focus-visible:ring-2 peer-focus-visible:ring-ink",
                  n <= (hover || rating) ? "fill-ink text-ink" : "text-ink-300",
                )}
              />
            </label>
          ))}
        </div>
        <FieldError message={state.errors?.rating} />
      </fieldset>

      <TextField label="Titre" name="title" defaultValue={existing?.title} maxLength={100} error={state.errors?.title} />
      <Field label="Votre avis" name="comment" error={state.errors?.comment}>
        <Textarea
          id="comment"
          name="comment"
          rows={4}
          defaultValue={existing?.comment}
          aria-invalid={state.errors?.comment ? true : undefined}
          aria-describedby={state.errors?.comment ? "comment-error" : undefined}
        />
      </Field>
      <Button type="submit" variant="dark" disabled={pending}>
        {pending ? "Envoi…" : existing ? "Modifier mon avis" : "Publier mon avis"}
      </Button>
    </form>
  );
}
