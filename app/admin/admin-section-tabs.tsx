"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

type AdminView = "registrations" | "registrations_presskit" | "shirts";

export function AdminSectionTabs({ view }: { view: AdminView }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sectionKey = searchParams.toString();

  const resetScroll = () => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  useEffect(() => {
    resetScroll();
    const timer = window.setTimeout(resetScroll, 80);
    return () => window.clearTimeout(timer);
  }, [pathname, sectionKey]);

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
