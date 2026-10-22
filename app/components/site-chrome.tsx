"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, Menu, MessageCircle, ShieldCheck, X } from "lucide-react";
import { useEffect, useState } from "react";

const navigation = [
  { href: "/", label: "Início" },
  { href: "/acampamento", label: "Acampamento" },
  { href: "/celulas", label: "Células" },
  { href: "/loja", label: "Loja Rise" },
];

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <header className="site-header">
        <div className="nav-shell">
          <Link href="/" className="brand" aria-label="Coletivo Rise — início">
            <img src="/assets/logo-rise.jpg" alt="" />
            <span><strong>COLETIVO</strong> RISE</span>
          </Link>

          <nav className="desktop-nav" aria-label="Navegação principal">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href} className={pathname === item.href ? "active" : ""}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="header-actions">
            <Link href="/inscricao" className="header-cta">Inscrição <span>Acampa</span></Link>
            {pathname === "/inscricao" && (
              <Link href="/admin" className="header-admin-link" aria-label="Abrir área administrativa">
                <ShieldCheck /> <span>Admin</span>
              </Link>
            )}
          </div>
          <button className="menu-button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={open ? "Fechar menu" : "Abrir menu"}>
            {open ? <X /> : <Menu />}
          </button>
        </div>

        {open && (
          <nav className="mobile-nav" aria-label="Navegação para celular">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href} className={pathname === item.href ? "active" : ""}>{item.label}</Link>
            ))}
            <Link href="/inscricao" className="mobile-cta">Inscrição Acampa</Link>
            {pathname === "/inscricao" && <Link href="/admin" className="mobile-admin-link"><ShieldCheck /> Área administrativa</Link>}
          </nav>
        )}
      </header>

      {children}

      <footer className="site-footer">
        <div className="footer-shell">
          <div className="footer-brand">
            <img src="/assets/logo-rise.jpg" alt="" />
            <div><strong>Coletivo Rise</strong><span>Uma geração que se levanta.</span></div>
          </div>
          <div className="footer-social">
            <Link href="/privacidade">Privacidade</Link>
            <a href="https://www.instagram.com/coletivo_rise/" target="_blank" rel="noreferrer"><Camera /> @coletivo_rise</a>
            <a href="https://wa.me/5511968778688" target="_blank" rel="noreferrer"><MessageCircle /> WhatsApp</a>
          </div>
          <p>© 2026 Coletivo Rise. Feito para uma geração em movimento.</p>
        </div>
      </footer>
    </>
  );
}
