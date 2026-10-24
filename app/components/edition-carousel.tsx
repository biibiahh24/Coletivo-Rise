"use client";

import { ArrowLeft, ArrowRight, ArrowUpRight, ShoppingBag, X } from "lucide-react";
import { useEffect, useState } from "react";

const slides = [
  {
    src: "/assets/camiseta-rise-01.jpeg",
    alt: "Estampa completa da camiseta Rise Edição 01",
    caption: "A mensagem que veste uma geração",
  },
  {
    src: "/assets/camiseta-rise-detalhe.jpeg",
    alt: "Detalhes da estampa Uma geração que se levanta",
    caption: "Joel 2:28–29 em cada detalhe",
    fit: "contain",
  },
  {
    src: "/assets/camiseta-rise-dupla.jpeg",
    alt: "Duas jovens usando a camiseta Rise Edição 01 ao ar livre",
    caption: "Uma geração que se levanta",
  },
  {
    src: "/assets/camiseta-rise-02.jpeg",
    alt: "Jovens usando a camiseta Rise Edição 01",
    caption: "Feita para viver o movimento",
  },
];

export function EditionCarousel() {
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(
      () => setActive((current) => (current + 1) % slides.length),
      5000,
    );

    return () => window.clearInterval(timer);
  }, []);

  const goTo = (index: number) => {
    setActive((index + slides.length) % slides.length);
  };

  return (
    <article className="edition-carousel" aria-roledescription="carrossel" aria-label="Camiseta Rise Edição 01">
      <div className="edition-carousel-media" aria-live="polite">
        <div className="edition-main-photo" role="button" tabIndex={0} onClick={() => setLightboxOpen(true)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setLightboxOpen(true); }} aria-label="Ampliar foto principal">
          {slides.map((slide, index) => (
            <img
              className={`${index === active ? "active" : ""} ${slide.fit === "contain" ? "product-contain" : ""}`.trim()}
              key={slide.src}
              src={slide.src}
              alt={index === active ? slide.alt : ""}
              aria-hidden={index !== active}
            />
          ))}
          <span className="edition-carousel-caption">{slides[active].caption}</span>
          <div className="edition-media-controls" aria-label="Controles da galeria">
            <button type="button" onClick={(event) => { event.stopPropagation(); goTo(active - 1); }} aria-label="Foto anterior"><ArrowLeft /></button>
            <button type="button" onClick={(event) => { event.stopPropagation(); goTo(active + 1); }} aria-label="Próxima foto"><ArrowRight /></button>
          </div>
        </div>
        <div className="edition-thumbnails" aria-label="Miniaturas da camiseta">
          {slides.map((slide, index) => (
            <button
              type="button"
              className={index === active ? "active" : ""}
              key={`thumb-${slide.src}`}
              onClick={() => setActive(index)}
              aria-label={`Ver miniatura ${index + 1}`}
              aria-current={index === active ? "true" : undefined}
            >
              <img src={slide.src} alt="" aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>

      <div className="edition-carousel-copy">
        <span className="edition-number">Edição 01</span>
        <div>
          <p className="edition-kicker">Coleção oficial Rise</p>
          <h3>Uma geração que se levanta.</h3>
          <p>Uma única camiseta, apresentada por diferentes ângulos para você conhecer a estampa, o caimento e os detalhes.</p>
        </div>

        <div className="edition-price"><span>A partir de</span><strong>R$ 49,90</strong></div>

        <div className="edition-carousel-footer">
          <div className="edition-carousel-controls">
            <button type="button" onClick={() => goTo(active - 1)} aria-label="Foto anterior"><ArrowLeft /></button>
            <span>{String(active + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}</span>
            <button type="button" onClick={() => goTo(active + 1)} aria-label="Próxima foto"><ArrowRight /></button>
          </div>
          <a href="#pedido-camiseta" className="edition-order-link"><ShoppingBag size={20} /> Quero a minha <ArrowUpRight /></a>
        </div>

        <div className="edition-dots" aria-label="Escolher foto">
          {slides.map((slide, index) => (
            <button
              type="button"
              className={index === active ? "active" : ""}
              key={slide.src}
              onClick={() => setActive(index)}
              aria-label={`Mostrar foto ${index + 1}`}
              aria-current={index === active ? "true" : undefined}
            />
          ))}
        </div>
      </div>
      {lightboxOpen && (
        <div className="edition-lightbox" role="dialog" aria-modal="true" aria-label="Foto ampliada" onClick={() => setLightboxOpen(false)}>
          <button type="button" className="edition-lightbox-close" onClick={() => setLightboxOpen(false)} aria-label="Fechar foto ampliada"><X /></button>
          <img src={slides[active].src} alt={slides[active].alt} onClick={(event) => event.stopPropagation()} />
        </div>
      )}
    </article>
  );
}
