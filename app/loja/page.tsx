import type { Metadata } from "next";
import { ArrowUpRight, Check, CreditCard, Heart, PackageCheck, Ruler, Shirt, ShoppingBag, Sparkles, Truck } from "lucide-react";
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

      <section className="section-shell collection-drop" aria-labelledby="drop-title">
        <div className="collection-drop-hero">
          <div className="collection-drop-art" aria-hidden="true">
            <img className="collection-drop-shirt" src="/assets/camiseta-rise-hero.png" alt="" />
            <img className="collection-drop-presskit" src="/assets/presskit-rise.png" alt="" />
          </div>
          <div className="collection-drop-copy">
            <span className="eyebrow light"><Sparkles size={16} /> Nova coleção</span>
            <h2 id="drop-title">Levanta-te e resplandece.</h2>
            <p>Mais que merch: identidade, propósito e uma geração que escolhe se levantar e resplandecer.</p>
            <a href="#collection-products" className="button button-light">Conhecer a coleção <ArrowUpRight /></a>
          </div>
          <div className="collection-drop-seal"><Shirt /><span>Disponível em breve</span></div>
        </div>
      </section>

      <section className="section-shell collection-detail" id="collection-products" aria-labelledby="collection-detail-title">
        <div className="collection-detail-heading">
          <span className="eyebrow"><Sparkles size={16} /> Levanta-te e resplandece</span>
          <h2 id="collection-detail-title">Mais que merch. <em>Identidade e propósito.</em></h2>
          <p>Escolha a peça que acompanha sua caminhada ou leve a caixa completa com os símbolos da nova coleção.</p>
        </div>
        <div className="collection-products">
          <article className="collection-product-card">
            <div className="collection-product-art collection-shirt-art">
              <img src="/assets/camiseta-rise-nova-colecao.png" alt="Camiseta Rise Eu sou a porta com frente, verso e detalhes" />
            </div>
            <div className="collection-product-content">
              <span className="collection-product-kicker">Somente camiseta</span>
              <h3>Camiseta Rise</h3>
              <strong>R$ 79,90</strong>
              <p>Modelagem confortável com a identidade “Eu sou a porta” na frente e a arte Porta no verso.</p>
              <a className="button button-orange" href="#pedido-camiseta">Comprar camiseta <ShoppingBag size={17} /></a>
            </div>
          </article>

          <article className="collection-product-card">
            <div className="collection-product-art collection-presskit-art">
              <img src="/assets/presskit-rise.png" alt="Presskit Rise com camiseta e acessórios" />
            </div>
            <div className="collection-product-content">
              <span className="collection-product-kicker">Presskit Rise</span>
              <h3>A caixa completa</h3>
              <strong>R$ 119,90</strong>
              <p>A camiseta Levanta-te e Resplandece acompanhada de itens exclusivos para carregar a mensagem.</p>
              <div className="collection-kit-list">
                <span><Shirt size={15} /> Camiseta</span><span><Sparkles size={15} /> Adesivos</span><span><PackageCheck size={15} /> Cordão, pulseira e chaveiro</span>
              </div>
              <a className="button button-orange" href="#pedido-camiseta">Comprar presskit <ShoppingBag size={17} /></a>
            </div>
          </article>
        </div>

        <div className="collection-trust" aria-label="Benefícios da compra">
          <span><Truck size={20} /> Envio seguro</span><span><CreditCard size={20} /> Pagamento seguro</span><span><PackageCheck size={20} /> Embalagem exclusiva</span><span><Heart size={20} /> Apoia o ministério Rise</span>
        </div>
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

