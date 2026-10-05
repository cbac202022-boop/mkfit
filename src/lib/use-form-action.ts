"use client";

import { useActionState, useTransition, type FormEvent } from "react";
import type { FormState } from "@/lib/validations";

/**
 * Comme useActionState, mais via onSubmit : React ne réinitialise pas le formulaire,
 * l'utilisateur garde sa saisie quand la validation échoue.
 */
export function useFormAction(
  serverAction: (prev: FormState, formData: FormData) => Promise<FormState>,
  onBeforeSubmit?: (formData: FormData) => void,
) {
  const [state, dispatch, actionPending] = useActionState<FormState, FormData>(serverAction, {});
  const [transitionPending, startTransition] = useTransition();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onBeforeSubmit?.(formData);
    startTransition(() => dispatch(formData));
  }

  return { state, onSubmit, pending: actionPending || transitionPending };
}
