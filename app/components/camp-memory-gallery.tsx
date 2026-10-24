"use client";

import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { useRef, useState } from "react";

const campMemories = [
  { image: "/assets/camp-memory-01.jpeg", label: "Momento", alt: "Momento vivido no Acampamento Rise" },
  { image: "/assets/camp-memory-02.jpeg", label: "Momento", alt: "Momento vivido no Acampamento Rise" },
  { image: "/assets/camp-memory-03.jpeg", label: "Momento", alt: "Momento vivido no Acampamento Rise" },
  { image: "/assets/camp-memory-04.jpeg", label: "Momento", alt: "Momento vivido no Acampamento Rise" },
  { image: "/assets/camp-memory-05.jpeg", label: "Momento", alt: "Momento vivido no Acampamento Rise" },
  { image: "/assets/camp-memory-06.jpeg", label: "Momento", alt: "Momento vivido no Acampamento Rise" },
  { image: "/assets/camp-memory-07.jpeg", label: "Momento", alt: "Momento vivido no Acampamento Rise" },
  { image: "/assets/camp-memory-08.jpeg", label: "Momento", alt: "Momento vivido no Acampamento Rise" },
  { image: "/assets/camp-memory-09.jpeg", label: "Momento", alt: "Momento vivido no Acampamento Rise" },
  { image: "/assets/camp-memory-10.jpeg", label: "Momento", alt: "Momento vivido no Acampamento Rise" },
  { image: "/assets/camp-memory-11.jpeg", label: "Momento", alt: "Momento vivido no Acampamento Rise" },
  { image: "/assets/camp-memory-12.jpeg", label: "Momento", alt: "Momento vivido no Acampamento Rise" },
  { image: "/assets/camp-memory-13.jpeg", label: "Momento", alt: "Momento vivido no Acampamento Rise" },
  { image: "/assets/camp-memory-14.jpeg", label: "Momento", alt: "Momento vivido no Acampamento Rise" },
  { image: "/assets/camp-memory-15.jpeg", label: "Momento", alt: "Momento vivido no Acampamento Rise" },
  { image: "/assets/camp-memory-16.jpeg", label: "Momento", alt: "Momento vivido no Acampamento Rise" },
  { image: "/assets/camp-memory-17.jpeg", label: "Momento", alt: "Momento vivido no Acampamento Rise" },
  { image: "/assets/camp-memory-18.jpeg", label: "Momento", alt: "Momento vivido no Acampamento Rise" },
  { image: "/assets/camp-memory-19.jpeg", label: "Momento", alt: "Momento vivido no Acampamento Rise" },
  { image: "/assets/camp-memory-20.jpeg", label: "Momento", alt: "Momento vivido no Acampamento Rise" },
  { image: "/assets/camp-memory-21.jpeg", label: "Momento", alt: "Momento vivido no Acampamento Rise" },
];

export function CampMemoryGallery() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [lightboxImage, setLightboxImage] = useState<(typeof campMemories)[number] | null>(null);

  const move = (direction: number) => {
    trackRef.current?.scrollBy({ left: direction * 380, behavior: "smooth" });
  };

  return (
    <div className="camp-memory-carousel" aria-roledescription="carrossel" aria-label="Momentos de edições anteriores do Acampamento Rise">
      <div className="camp-memory-controls">
        <span>{campMemories.length} momentos</span>
        <div>
          <button type="button" onClick={() => move(-1)} aria-label="Ver fotos anteriores"><ArrowLeft /></button>
          <button type="button" onClick={() => move(1)} aria-label="Ver próximas fotos"><ArrowRight /></button>
        </div>
      </div>
      <div className="camp-memory-track" ref={trackRef}>
        {campMemories.map((memory, index) => (
          <figure
            className="camp-memory-card"
            key={memory.image}
            role="button"
            tabIndex={0}
            aria-label={`Ampliar foto ${index + 1}`}
            onClick={() => setLightboxImage(memory)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setLightboxImage(memory);
              }
            }}
          >
            <img src={memory.image} alt={memory.alt} loading={index > 3 ? "lazy" : undefined} />
            <figcaption><span>{String(index + 1).padStart(2, "0")}</span>{memory.label}</figcaption>
          </figure>
        ))}
      </div>
      <p className="camp-memory-hint">Deslize para ver mais momentos</p>
      {lightboxImage && (
        <div className="edition-lightbox" role="dialog" aria-modal="true" aria-label="Foto ampliada" onClick={() => setLightboxImage(null)}>
          <button type="button" className="edition-lightbox-close" onClick={() => setLightboxImage(null)} aria-label="Fechar foto ampliada"><X /></button>
          <img src={lightboxImage.image} alt={lightboxImage.alt} onClick={(event) => event.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
