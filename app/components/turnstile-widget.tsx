"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (target: HTMLElement, options: Record<string, unknown>) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

export function TurnstileWidget({ action, onToken, resetSignal = 0 }: { action: string; onToken: (token: string) => void; resetSignal?: number }) {
  const targetRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<string | null>(null);
  const [siteKey, setSiteKey] = useState("");

  useEffect(() => {
    fetch("/api/form-config", { cache: "no-store" })
      .then((response) => response.json())
      .then((value: unknown) => {
        const data = value as { configured?: boolean; siteKey?: string };
        const nextSiteKey = data.configured ? (data.siteKey ?? "") : "";
        setSiteKey(nextSiteKey);
        onToken(nextSiteKey ? "" : "turnstile-not-configured");
      })
      .catch(() => {
        setSiteKey("");
        onToken("");
      });
  }, [onToken]);

  useEffect(() => {
    if (!siteKey || !targetRef.current) return;
    let cancelled = false;
    const render = () => {
      if (cancelled || !targetRef.current || !window.turnstile || widgetRef.current) return;
      widgetRef.current = window.turnstile.render(targetRef.current, {
        sitekey: siteKey,
        action,
        theme: "light",
        size: "flexible",
        callback: (token: string) => onToken(token),
        "expired-callback": () => onToken(""),
        "error-callback": () => onToken(""),
      });
    };
    const existing = document.querySelector<HTMLScriptElement>('script[data-rise-turnstile="true"]');
    if (window.turnstile) render();
    else if (existing) existing.addEventListener("load", render, { once: true });
    else {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.defer = true;
      script.dataset.riseTurnstile = "true";
      script.addEventListener("load", render, { once: true });
      document.head.appendChild(script);
    }
    return () => {
      cancelled = true;
      if (widgetRef.current && window.turnstile) window.turnstile.remove(widgetRef.current);
      widgetRef.current = null;
    };
  }, [action, onToken, siteKey]);

  useEffect(() => {
    if (resetSignal && widgetRef.current && window.turnstile) {
      window.turnstile.reset(widgetRef.current);
      onToken("");
    }
  }, [onToken, resetSignal]);

  if (!siteKey) return <p className="security-unavailable">Envio protegido pelo controle de segurança do site.</p>;
  return <div className="turnstile-shell" ref={targetRef} aria-label="Verificação de segurança" />;
}
