"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import { ProductImageLightbox } from "./product-image-lightbox";

const shirts = [
  { src: "/assets/product-camiseta-branca.jpg", alt: "Camiseta Rise branca, frente e costas" },
  { src: "/assets/product-camiseta-roxa.jpg", alt: "Camiseta Rise roxa, frente e costas" },
];

export function ProductShirtCarousel() {
  const [active, setActive] = useState(0);

  const move = (direction: number) => {
    setActive((current) => (current + direction + shirts.length) % shirts.length);
  };

  return (
    <div className="collection-product-art collection-shirt-art collection-shirt-carousel">
      <ProductImageLightbox src={shirts[active].src} alt={shirts[active].alt} />
      <div className="collection-shirt-carousel-controls" aria-label="Controles das camisetas">
        <button type="button" onClick={() => move(-1)} aria-label="Camiseta anterior"><ArrowLeft size={18} /></button>
        <div className="collection-shirt-carousel-dots" aria-label="Selecionar camiseta">
          {shirts.map((shirt, index) => (
            <button
              key={shirt.src}
              type="button"
              className={index === active ? "active" : ""}
              onClick={() => setActive(index)}
              aria-label={`Ver camiseta ${index + 1}`}
              aria-current={index === active ? "true" : undefined}
            />
          ))}
        </div>
        <button type="button" onClick={() => move(1)} aria-label="Próxima camiseta"><ArrowRight size={18} /></button>
      </div>
    </div>
  );
}
