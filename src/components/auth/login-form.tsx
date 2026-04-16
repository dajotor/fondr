"use client";

import { useActionState } from "react";

import { initialSignInFormState } from "@/features/auth/actions/form-state";
import {
  signInWithMagicLink,
} from "@/features/auth/actions/sign-in";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    signInWithMagicLink,
    initialSignInFormState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="text-sm font-medium text-foreground/90"
        >
          E-Mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="max@beispiel.de"
          required
          className="h-12 w-full rounded-2xl border border-input bg-background px-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
        />
      </div>

      {state.error ? (
        <p className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      {state.success ? (
        <p className="rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3 text-sm text-foreground">
          {state.success}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Wird gesendet..." : "Magic Link senden"}
      </button>
    </form>
  );
}
