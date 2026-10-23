import type { Metadata } from "next";
import { ArrowUpRight, Check, PackageCheck, Ruler, Shirt, Sparkles } from "lucide-react";
import { EditionCarousel } from "../components/edition-carousel";
import { ShirtOrder } from "../components/shirt-order";
import { SectionHero } from "../components/section-hero";

export const metadata: Metadata = {
  title: "Loja Rise",
  description: "Conheça a primeira coleção oficial do Coletivo Rise.",
};

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
        <div className="store-intro-visual">
          <img src="/assets/camiseta-rise-editorial.jpeg" alt="Jovens do Coletivo Rise apresentando a primeira coleção oficial" />
          <span>Vista a mensagem</span>
        </div>
        <div className="collection-copy">
          <span className="eyebrow"><Sparkles size={16} /> Loja oficial Rise</span>
          <h2>Fé, identidade e propósito em cada peça.</h2>
          <p>A Loja Rise nasceu para levar a mensagem do coletivo para além dos encontros. Cada coleção transforma aquilo em que acreditamos em peças cheias de significado, feitas para uma geração que não tem medo de viver sua fé.</p>
          <div className="store-intro-points">
            <span><Shirt size={18} /> Coleções autorais</span>
            <span><PackageCheck size={18} /> Pedido direto com a equipe</span>
          </div>
          <a className="button button-orange" href="#products-title">Conhecer a Edição 01 <ArrowUpRight size={18} /></a>
        </div>
      </section>

      <section className="section-shell drop-teaser" aria-labelledby="drop-title">
        <div className="drop-media">
          <img src="/assets/nova-colecao-levanta-te.png" alt="Nova coleção Rise Levanta-te e Resplandece" />
          <span>Nova coleção</span>
        </div>
        <div className="drop-copy">
          <span className="eyebrow light"><Sparkles size={16} /> Nova coleção</span>
          <h2 id="drop-title">Levanta-te e resplandece.</h2>
          <p>Uma coleção que celebra identidade, propósito e uma geração que escolhe se levantar e resplandecer.</p>
          <a href="https://www.instagram.com/coletivo_rise/" target="_blank" rel="noreferrer" className="button button-light">Acompanhar lançamento <ArrowUpRight /></a>
        </div>
        <div className="drop-seal"><Shirt /><span>Em breve</span></div>
      </section>

      <section className="section-shell product-section" aria-labelledby="products-title">
        <div className="section-heading split-heading">
          <div><span className="eyebrow"><Shirt size={16} /> Primeira edição</span><h2 id="products-title">Uma peça. Uma mensagem.</h2></div>
          <p>Conheça a Edição 01 em uma apresentação única, com todos os ângulos da camiseta oficial do Rise.</p>
        </div>
        <EditionCarousel />
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

