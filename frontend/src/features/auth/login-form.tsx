"use client";

import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { ApiError } from "@/lib/api";
import { useLogin } from "./api";

const DEMO_EMAIL = process.env.NEXT_PUBLIC_DEMO_EMAIL;
const DEMO_PASSWORD = process.env.NEXT_PUBLIC_DEMO_PASSWORD;

export function LoginForm() {
  const login = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const error = login.error instanceof ApiError ? login.error : undefined;
  const fieldErrors = error?.fieldErrors() ?? {};
  const formError = error && error.details.length === 0 ? error.message : undefined;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    login.mutate({ email, password });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {formError && (
        <p role="alert" className="rounded-xl bg-danger-bg px-3.5 py-2.5 text-sm font-semibold text-danger">
          {formError}
        </p>
      )}
      <Field label="E-posta" error={fieldErrors.email}>
        {(props) => (
          <Input
            {...props}
            type="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        )}
      </Field>
      <Field label="Şifre" error={fieldErrors.password}>
        {(props) => (
          <Input
            {...props}
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        )}
      </Field>
      <Button type="submit" loading={login.isPending} className="mt-2 w-full justify-center">
        Giriş yap
      </Button>
      {DEMO_EMAIL && DEMO_PASSWORD && (
        <div className="mt-2 flex items-center gap-3 rounded-2xl border border-dashed border-line bg-surface/60 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-bold">Demo hesabı</p>
            <p className="truncate text-xs text-muted">{DEMO_EMAIL}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEmail(DEMO_EMAIL);
              setPassword(DEMO_PASSWORD);
            }}
          >
            Bilgileri doldur
          </Button>
        </div>
      )}
    </form>
  );
}
