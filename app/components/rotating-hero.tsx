"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Flame, Shirt, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

const slides = [
  {
    label: "Coletivo Rise",
    title: <>Uma geração que <em>se levanta.</em></>,
    text: "Juventude com propósito, fé e movimento. Um lugar para crescer, pertencer e viver algo novo com Deus.",
    href: "/#quem-somos",
    action: "Conheça o coletivo",
    icon: Sparkles,
    image: "/assets/encontro-rise-04.jpeg",
    alt: "Jovens reunidos em um encontro do Coletivo Rise",
  },
  {
    label: "Acampamento Rise • 2027",
    title: <>A próxima história <em>começa em 2027.</em></>,
    text: "Louvor, ensino, comunhão e encontros com Deus em uma nova edição criada para jovens.",
    href: "/inscricao",
    action: "Garantir minha vaga",
    icon: Flame,
    image: "/assets/acampamento-memoria-01.jpg",
    alt: "Jovens participando de uma atividade no Acampamento Rise",
  },
  {
    label: "Loja Rise • Novo drop em breve",
    title: <>Vista o movimento. <em>Espere o inesperado.</em></>,
    text: "Conheça a coleção atual e acompanhe o lançamento das próximas camisetas do Rise.",
    href: "/loja",
    action: "Ver a coleção",
    icon: Shirt,
    image: "/assets/camiseta-rise-01.jpeg",
    alt: "Camiseta oficial Uma geração que se levanta",
  },
];

export function RotatingHero() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => setActive((value) => (value + 1) % slides.length), 6500);
    return () => window.clearInterval(timer);
  }, [paused]);

  const go = (next: number) => setActive((next + slides.length) % slides.length);

  return (
    <section className="hero-rotator" aria-roledescription="carrossel" aria-label="Destaques do Coletivo Rise" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="hero-orbit orbit-one" aria-hidden="true" />
      <div className="hero-orbit orbit-two" aria-hidden="true" />
      <div className="hero-slides">
        {slides.map((slide, index) => {
          const Icon = slide.icon;
          return (
            <article className={`hero-slide ${index === active ? "active" : ""}`} aria-hidden={index !== active} key={slide.label}>
              <div className="hero-copy">
                <span className="hero-kicker"><Icon size={16} /> {slide.label}</span>
                <h1>{slide.title}</h1>
                <p>{slide.text}</p>
                <div className="hero-actions">
                  <Link href={slide.href} className="button button-light">{slide.action} <ArrowUpRight size={18} /></Link>
                  {index !== 1 && <Link href="/inscricao" className="button button-ghost">Inscrição Acampa</Link>}
                </div>
              </div>
              <div className="hero-image-wrap">
                <img src={slide.image} alt={slide.alt} />
                <div className="image-caption"><BookOpen size={16} /><span>“Levanta-te, resplandece”</span><small>Isaías 60:1</small></div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="hero-controls">
        <button onClick={() => go(active - 1)} aria-label="Destaque anterior"><ArrowLeft /></button>
        <div className="hero-dots" role="tablist" aria-label="Escolher destaque">
          {slides.map((slide, index) => (
            <button key={slide.label} className={index === active ? "active" : ""} onClick={() => setActive(index)} aria-label={`Mostrar ${slide.label}`} aria-selected={index === active} role="tab"><span /></button>
          ))}
        </div>
        <button onClick={() => go(active + 1)} aria-label="Próximo destaque"><ArrowRight /></button>
      </div>
    </section>
  );
}
