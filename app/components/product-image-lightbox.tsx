"use client";

import { X } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

type ProductImageLightboxProps = {
  src: string;
  alt: string;
  className?: string;
};

export function ProductImageLightbox({ src, alt, className = "" }: ProductImageLightboxProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

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
      {open && typeof document !== "undefined" && createPortal(
        <div className="collection-image-lightbox" role="dialog" aria-modal="true" aria-label={`Imagem ampliada: ${alt}`} onClick={() => setOpen(false)}>
          <button type="button" className="collection-image-lightbox-close" onClick={() => setOpen(false)} aria-label="Fechar imagem ampliada"><X /></button>
          <img src={src} alt={alt} onClick={(event) => event.stopPropagation()} />
        </div>,
        document.body,
      )}
    </>
  );
}
