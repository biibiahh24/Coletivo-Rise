"use client";

import { X } from "lucide-react";
import { useState } from "react";

type ProductImageLightboxProps = {
  src: string;
  alt: string;
  className?: string;
};

export function ProductImageLightbox({ src, alt, className = "" }: ProductImageLightboxProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={`collection-image-trigger ${className}`}
        onClick={() => setOpen(true)}
        aria-label={`Ampliar ${alt}`}
      >
        <img src={src} alt={alt} />
      </button>
      {open && (
        <div className="collection-image-lightbox" role="dialog" aria-modal="true" aria-label={`Imagem ampliada: ${alt}`} onClick={() => setOpen(false)}>
          <button type="button" className="collection-image-lightbox-close" onClick={() => setOpen(false)} aria-label="Fechar imagem ampliada"><X /></button>
          <img src={src} alt={alt} onClick={(event) => event.stopPropagation()} />
        </div>
      )}
    </>
  );
}
