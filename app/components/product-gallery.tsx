"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

const images = [
  { src: "/assets/camiseta-rise-01.jpeg", alt: "Camiseta Rise com a estampa Uma geração que se levanta" },
  { src: "/assets/camiseta-rise-02.jpeg", alt: "Jovens usando a camiseta oficial do Rise" },
  { src: "/assets/camiseta-rise-03.jpeg", alt: "Detalhe da camiseta oficial do Coletivo Rise" },
];

export function ProductGallery() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setActive((value) => (value + 1) % images.length), 5500);
    return () => window.clearInterval(timer);
  }, []);

  const go = (value: number) => setActive((value + images.length) % images.length);

  return (
    <div className="product-gallery" aria-roledescription="carrossel" aria-label="Fotos da coleção Rise">
      <div className="product-gallery-frame">
        {images.map((image, index) => <img className={index === active ? "active" : ""} key={image.src} src={image.src} alt={image.alt} aria-hidden={index !== active} />)}
        <div className="gallery-arrows">
          <button onClick={() => go(active - 1)} aria-label="Foto anterior"><ArrowLeft /></button>
          <span>{String(active + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}</span>
          <button onClick={() => go(active + 1)} aria-label="Próxima foto"><ArrowRight /></button>
        </div>
      </div>
      <div className="product-thumbs">
        {images.map((image, index) => <button className={index === active ? "active" : ""} key={image.src} onClick={() => setActive(index)} aria-label={`Mostrar foto ${index + 1}`}><img src={image.src} alt="" /></button>)}
      </div>
    </div>
  );
}
