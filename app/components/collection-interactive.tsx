"use client";

import { Info, X } from "lucide-react";
import { useState } from "react";

const items = [
  { id: "shirt", label: "Camisetas", title: "Camisetas Rise", text: "Duas opções de cor para vestir a mensagem: off-white com estampa laranja ou roxa com estampa laranja.", className: "interactive-hotspot-shirt", images: ["/assets/product-camiseta-branca.jpg", "/assets/product-camiseta-roxa.jpg"], imageAlt: "Camisetas Rise nas cores off-white e roxa" },
  { id: "lanyard", label: "Cordão", title: "Cordão Rise", text: "Cordão estampado com mosquetão, pensado para acompanhar sua rotina com a identidade do coletivo.", className: "interactive-hotspot-lanyard", images: ["/assets/product-cordao.jpg"], imageAlt: "Mockup do cordão Rise" },
  { id: "stickers", label: "Figurinhas", title: "Cartela de figurinhas", text: "Símbolos do Rise para personalizar cadernos, garrafas e tudo o que acompanha sua caminhada.", className: "interactive-hotspot-stickers", images: ["/assets/product-figurinhas.jpg"], imageAlt: "Cartela de figurinhas Rise" },
  { id: "keychain", label: "Chaveiro", title: "Chaveiro Rise", text: "Chaveiro em formato de sol com acabamento translúcido e a assinatura Coletivo Rise.", className: "interactive-hotspot-wristband", images: ["/assets/product-chaveiro.jpg"], imageAlt: "Chaveiro Rise" },
  { id: "box", label: "Caixa", title: "Caixa do kit", text: "Escolha a cor da caixa que combina com seu kit: laranja, off-white ou roxo Rise.", className: "interactive-hotspot-box", images: ["/assets/product-caixa.jpg"], imageAlt: "Opções de caixa do kit Rise" },
];

export function CollectionInteractive() {
  const [selected, setSelected] = useState<(typeof items)[number] | null>(null);

  return (
    <div className="collection-interactive" aria-label="Presskit interativo">
      <div className="collection-interactive-stage">
        <img className="collection-interactive-image" src="/assets/presskit-exploded.png" alt="Composição explodida do presskit Rise com camiseta, caixa, adesivos, cordão e pulseira" />
        <div className="collection-interactive-hotspots" aria-label="Clique nos itens para ver detalhes">
        {items.map((item) => (
          <button key={item.id} type="button" className={`interactive-hotspot ${item.className}`} onClick={() => setSelected(item)} aria-label={`Ver detalhes: ${item.label}`}>
            <span><Info size={15} /></span>
          </button>
        ))}
        </div>
      </div>

      {selected && (
        <div className="collection-modal-backdrop" role="presentation" onClick={() => setSelected(null)}>
          <div className="collection-modal" role="dialog" aria-modal="true" aria-labelledby="collection-modal-title" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="collection-modal-close" onClick={() => setSelected(null)} aria-label="Fechar detalhes"><X size={20} /></button>
            <div className="collection-modal-gallery">
              {selected.images.map((image) => <img key={image} src={image} alt={selected.imageAlt} />)}
            </div>
            <span className="eyebrow"><Info size={15} /> Detalhe da coleção</span>
            <h3 id="collection-modal-title">{selected.title}</h3>
            <p>{selected.text}</p>
            <button type="button" className="button button-orange" onClick={() => setSelected(null)}>Continuar explorando</button>
          </div>
        </div>
      )}
    </div>
  );
}
