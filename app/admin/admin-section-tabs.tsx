"use client";

import Link from "next/link";

type AdminView = "registrations" | "registrations_presskit" | "shirts";

export function AdminSectionTabs({ view }: { view: AdminView }) {
  const resetScroll = () => {
    window.scrollTo(0, 0);
    requestAnimationFrame(() => window.scrollTo(0, 0));
  };

  return (
    <nav aria-label="Tipos de registro">
      <Link className={view === "registrations" ? "active" : ""} href="/admin?view=registrations" onClick={resetScroll}>
        Acampamento
      </Link>
      <Link className={view === "registrations_presskit" ? "active" : ""} href="/admin?view=registrations_presskit" onClick={resetScroll}>
        Acampamento + Presskit
      </Link>
      <Link className={view === "shirts" ? "active" : ""} href="/admin?view=shirts" onClick={resetScroll}>
        Camisetas
      </Link>
    </nav>
  );
}
