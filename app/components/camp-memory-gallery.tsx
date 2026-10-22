"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRef } from "react";

const campMemories = [
  { image: "/assets/acampamento-memoria-02.jpg", label: "Encontro", alt: "Jovem vivendo um momento de reflexão no acampamento" },
  { image: "/assets/acampamento-memoria-03.jpg", label: "Alegria", alt: "Jovens em um momento de lazer na piscina do acampamento" },
  { image: "/assets/acampamento-memoria-04.jpg", label: "Identidade", alt: "Jovem participando de uma dinâmica sobre identidade no acampamento" },
  { image: "/assets/acampamento-memoria-06.jpg", label: "Cuidado", alt: "Momento de oração e cuidado entre jovens no acampamento" },
  { image: "/assets/acampamento-memoria-08.jpg", label: "Palavra", alt: "Jovem lendo a Bíblia durante o acampamento" },
  { image: "/assets/acampamento-memoria-09.jpg", label: "Comunhão", alt: "Jovens conversando e sorrindo durante o acampamento" },
  { image: "/assets/acampamento-edicao-anterior-01.jpeg", label: "Acolhimento", alt: "Jovens se abraçando em um momento de oração no acampamento" },
  { image: "/assets/acampamento-edicao-anterior-02.jpeg", label: "Entrega", alt: "Jovem ajoelhada durante um momento de oração" },
  { image: "/assets/acampamento-edicao-anterior-03.jpeg", label: "Amizade", alt: "Amigas se abraçando e sorrindo no acampamento" },
  { image: "/assets/acampamento-edicao-anterior-04.jpeg", label: "Unidade", alt: "Jovens de mãos dadas durante uma dinâmica em grupo", wide: true },
  { image: "/assets/acampamento-edicao-anterior-05.jpeg", label: "Liderança", alt: "Líder orientando uma atividade ao ar livre no acampamento" },
  { image: "/assets/acampamento-edicao-anterior-06.jpeg", label: "Propósito", alt: "Jovens reunidos em círculo para uma atividade", wide: true },
  { image: "/assets/acampamento-edicao-anterior-07.jpeg", label: "Escrituras", alt: "Participante lendo a Bíblia durante o acampamento" },
  { image: "/assets/acampamento-edicao-anterior-08.jpeg", label: "Reflexão", alt: "Jovem escrevendo em seu caderno durante a Palavra" },
  { image: "/assets/acampamento-edicao-anterior-09.jpeg", label: "Louvor", alt: "Jovem tocando violão durante um momento de louvor" },
  { image: "/assets/acampamento-edicao-anterior-10.jpeg", label: "Oração", alt: "Jovem orando próximo à janela" },
  { image: "/assets/acampamento-edicao-anterior-11.jpeg", label: "Presença", alt: "Jovens reunidas em oração durante o acampamento" },
  { image: "/assets/acampamento-edicao-anterior-12.jpeg", label: "Partilha", alt: "Jovens compartilhando uma conversa à mesa", wide: true },
];

export function CampMemoryGallery() {
  const trackRef = useRef<HTMLDivElement>(null);

  const move = (direction: number) => {
    trackRef.current?.scrollBy({ left: direction * 380, behavior: "smooth" });
  };

  return (
    <div className="camp-memory-carousel" aria-roledescription="carrossel" aria-label="Momentos de edições anteriores do Acampamento Rise">
      <div className="camp-memory-controls">
        <span>{campMemories.length} momentos, nenhuma foto repetida</span>
        <div>
          <button type="button" onClick={() => move(-1)} aria-label="Ver fotos anteriores"><ArrowLeft /></button>
          <button type="button" onClick={() => move(1)} aria-label="Ver próximas fotos"><ArrowRight /></button>
        </div>
      </div>
      <div className="camp-memory-track" ref={trackRef}>
        {campMemories.map((memory, index) => (
          <figure className={`camp-memory-card${memory.wide ? " wide" : ""}`} key={memory.image}>
            <img src={memory.image} alt={memory.alt} loading={index > 3 ? "lazy" : undefined} />
            <figcaption><span>{String(index + 1).padStart(2, "0")}</span>{memory.label}</figcaption>
          </figure>
        ))}
      </div>
      <p className="camp-memory-hint">Deslize para ver mais momentos</p>
    </div>
  );
}
