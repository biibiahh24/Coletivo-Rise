import type { Metadata } from "next";
import { ArrowUpRight, Check, PackageCheck, Ruler, Shirt, Sparkles } from "lucide-react";
import { ProductGallery } from "../components/product-gallery";
import { ShirtOrder } from "../components/shirt-order";
import { SectionHero } from "../components/section-hero";

export const metadata: Metadata = {
  title: "Loja Rise",
  description: "Conheça a primeira coleção oficial do Coletivo Rise.",
};

const products = [
  { edition: "Edição 01", image: "/assets/camiseta-rise-01.jpeg" },
  { edition: "Edição 02", image: "/assets/camiseta-rise-02.jpeg" },
  { edition: "Edição 03", image: "/assets/camiseta-rise-03.jpeg" },
];

export default function LojaPage() {
  return (
    <main>
      <SectionHero
        eyebrow="Primeira coleção oficial"
        title={<>Vista aquilo em que <em>você acredita.</em></>}
        description="Uma coleção feita para carregar a mensagem do Rise para além dos encontros."
        icon={Shirt}
      >
        <a href="#colecao" className="button button-light">Ver coleção <ArrowUpRight size={18} /></a>
        <a href="#tamanhos" className="button button-ghost">Tamanhos e envio</a>
      </SectionHero>

      <section className="section-shell collection-feature" id="colecao">
        <ProductGallery />
        <div className="collection-copy">
          <span className="eyebrow"><Sparkles size={16} /> Coleção 01</span>
          <h2>Uma geração que se levanta.</h2>
          <p>A camiseta oficial une a identidade do Coletivo Rise à mensagem de Joel 2:28–29.</p>
          <div className="product-meta">
            <div><span>Valor</span><strong>R$ 49,90</strong></div>
            <div><span>Tamanhos</span><strong>P ao GG</strong></div>
          </div>
          <a className="button button-orange" href="#pedido-camiseta">Montar meu pedido <ArrowUpRight size={18} /></a>
          <p className="small-note"><PackageCheck size={17} /> Consulte disponibilidade, envio e formas de pagamento com a equipe.</p>
        </div>
      </section>

      <section className="section-shell drop-teaser" aria-labelledby="drop-title">
        <div className="drop-number" aria-hidden="true">02</div>
        <div className="drop-copy">
          <span className="eyebrow light"><Sparkles size={16} /> Próximo lançamento</span>
          <h2 id="drop-title">Uma nova coleção está se levantando.</h2>
          <p>Novos modelos do Coletivo Rise estão sendo preparados. Acompanhe o Instagram para ver o lançamento primeiro.</p>
          <a href="https://www.instagram.com/coletivo_rise/" target="_blank" rel="noreferrer" className="button button-light">Acompanhar lançamento <ArrowUpRight /></a>
        </div>
        <div className="drop-seal"><Shirt /><span>Em breve</span></div>
      </section>

      <section className="section-shell product-section" aria-labelledby="products-title">
        <div className="section-heading split-heading">
          <div><span className="eyebrow"><Shirt size={16} /> Modelos</span><h2 id="products-title">Escolha a sua edição.</h2></div>
          <p>Três registros da primeira coleção para você conhecer a peça e o movimento por trás dela.</p>
        </div>
        <div className="product-grid">
          {products.map((product, index) => (
            <article className="product-card" key={product.edition}>
              <div className="product-image"><img src={product.image} alt={`Camiseta Rise ${product.edition}`} /><span>0{index + 1}</span></div>
              <div><h3>Camiseta Rise</h3><p>{product.edition}</p><strong>R$ 49,90</strong></div>
              <a href="#pedido-camiseta" aria-label={`Montar pedido da ${product.edition}`}><ArrowUpRight /></a>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell size-section" id="tamanhos">
        <div className="size-title"><Ruler /><div><span className="eyebrow">Guia de medidas</span><h2>Encontre o seu tamanho.</h2></div></div>
        <div className="size-table" role="table" aria-label="Medidas das camisetas">
          <div role="row"><strong role="columnheader">Tamanho</strong><strong role="columnheader">Altura</strong><strong role="columnheader">Largura</strong></div>
          <div role="row"><span>P</span><span>65 cm</span><span>48 cm</span></div>
          <div role="row"><span>M</span><span>69 cm</span><span>51 cm</span></div>
          <div role="row"><span>G</span><span>73 cm</span><span>54 cm</span></div>
          <div role="row"><span>GG</span><span>78 cm</span><span>58 cm</span></div>
        </div>
        <div className="size-notes"><span><Check /> Pagamento via PIX</span><span><Check /> Envio combinado com a equipe</span><span><Check /> Trocas consultadas pelo WhatsApp</span></div>
      </section>

      <section className="section-shell order-section" id="pedido-camiseta">
        <div className="order-intro">
          <span className="eyebrow"><Shirt size={16} /> Pedido rápido</span>
          <h2>Escolha. Confira. Chame no WhatsApp.</h2>
          <p>Monte seu pedido e envie todas as informações de uma vez para a equipe Rise.</p>
        </div>
        <ShirtOrder />
      </section>
    </main>
  );
}
