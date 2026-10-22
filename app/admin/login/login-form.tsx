"use client";

import { FormEvent, useState } from "react";
import { Eye, EyeOff, LoaderCircle, LockKeyhole, LogIn, Mail } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.get("email"),
          password: formData.get("password"),
          next: searchParams.get("next") ?? "/admin",
        }),
      });
      const result = await response.json() as { error?: string; next?: string };
      if (!response.ok) throw new Error(result.error ?? "Não foi possível entrar.");
      router.replace(result.next ?? "/admin");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível entrar.");
    } finally {
      setSending(false);
    }
  }

  return (
    <form className="admin-login-form" onSubmit={submit}>
      <label>
        <span>E-mail administrativo</span>
        <div><Mail aria-hidden="true" /><input name="email" type="email" autoComplete="username" required /></div>
      </label>
      <label>
        <span>Senha</span>
        <div>
          <LockKeyhole aria-hidden="true" />
          <input name="password" type={showPassword ? "text" : "password"} minLength={10} autoComplete="current-password" required />
          <button type="button" className="admin-password-toggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>
            {showPassword ? <EyeOff /> : <Eye />}
          </button>
        </div>
      </label>
      {error && <p className="admin-login-error" role="alert">{error}</p>}
      <button className="button button-orange" type="submit" disabled={sending}>
        {sending ? <><LoaderCircle className="spinner" /> Entrando...</> : <><LogIn /> Entrar no painel</>}
      </button>
    </form>
  );
}

