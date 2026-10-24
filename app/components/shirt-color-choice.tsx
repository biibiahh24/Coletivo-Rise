"use client";

import { useState } from "react";
import { ProductImageLightbox } from "./product-image-lightbox";

const shirts = {
  offwhite: { label: "Off-white", src: "/assets/product-camiseta-branca.jpg" },
  roxa: { label: "Roxa", src: "/assets/product-camiseta-roxa.jpg" },
} as const;

export function ShirtColorChoice() {
  const [color, setColor] = useState<keyof typeof shirts>("offwhite");
  const shirt = shirts[color];

  return (
    <div className="camp-shirt-choice">
      <ProductImageLightbox className="camp-shirt-choice-image" src={shirt.src} alt={`Camiseta Rise ${shirt.label}`} />
      <div className="camp-choice-note" aria-label="Escolha a cor da camiseta">
        <span className="camp-choice-label">ESCOLHA A COR</span>
        {(Object.keys(shirts) as Array<keyof typeof shirts>).map((option) => (
          <button
            type="button"
            key={option}
            className={color === option ? "is-selected" : ""}
            onClick={() => setColor(option)}
            aria-pressed={color === option}
          >
            {shirts[option].label}
          </button>
        ))}
      </div>
    </div>
  );
}
