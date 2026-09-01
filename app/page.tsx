import Link from "next/link";
import {
  ArrowUpRight,
  Flame,
  HeartHandshake,
  Camera,
  MapPin,
  MessageCircle,
  Shirt,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { RotatingHero } from "./components/rotating-hero";

const experiences = [
  {
    icon: Flame,
    eyebrow: "Imersão",
    title: "Acampamento Rise",
    text: "Três dias de louvor, comunhão e crescimento espiritual.",
    href: "/acampamento",
  },
  {
    icon: Shirt,
    eyebrow: "Identidade",
    title: "Loja Rise",
    text: "Peças oficiais para vestir aquilo em que essa geração acredita.",
    href: "/loja",
  },
];

export default function Home() {
  return (
    <main>
      <RotatingHero />

      <section className="section-shell experience-section" aria-labelledby="experiencias-title">
        <div className="section-heading split-heading">
          <div>
            <span className="eyebrow"><Sparkles size={16} /> Viva o Rise</span>
            <h2 id="experiencias-title">Fé que sai do lugar.</h2>
          </div>
          <p>Encontros pensados para criar conexão, fortalecer a fé e movimentar uma geração inteira.</p>
        </div>

        <div className="experience-grid">
          {experiences.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link href={item.href} className={`experience-card card-${index + 1}`} key={item.title}>
                <div className="icon-chip"><Icon size={22} /></div>
                <span className="card-eyebrow">{item.eyebrow}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <span className="text-link">Descobrir <ArrowUpRight size={18} /></span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="section-shell about-section" id="quem-somos" aria-labelledby="about-title">
        <div className="about-visual">
          <img src="/assets/camiseta-rise-02.jpeg" alt="Jovens do Coletivo Rise usando a coleção oficial" />
          <div className="about-stamp" aria-hidden="true">
            <Flame size={28} />
            <span>Uma geração<br />que se levanta</span>
          </div>
        </div>

        <div className="about-copy">
          <span className="eyebrow"><UsersRound size={16} /> Quem somos</span>
          <h2 id="about-title">Jovens decididos a viver para Jesus.</h2>
          <p>
            Somos o Coletivo Rise. Cada encontro é uma oportunidade de crescer,
            se conectar e incendiar o coração com o amor de Deus.
          </p>
          <blockquote>
            “Levanta-te, resplandece, porque vem a tua luz, e a glória do Senhor nasce sobre ti.”
            <cite>Isaías 60:1</cite>
          </blockquote>
          <div className="value-list">
            <div><HeartHandshake size={19} /><span><strong>Missão</strong> Formar jovens centrados em Cristo.</span></div>
            <div><Flame size={19} /><span><strong>Visão</strong> Avivamento verdadeiro e transformação.</span></div>
            <div><Sparkles size={19} /><span><strong>Valores</strong> Comunhão, serviço e excelência.</span></div>
          </div>
          <Link href="/acampamento" className="button button-dark">Conheça o próximo acampamento <ArrowUpRight size={18} /></Link>
        </div>
      </section>

      <section className="section-shell cell-preview" aria-labelledby="cell-preview-title">
        <div className="cell-preview-copy">
          <span className="eyebrow light"><UsersRound size={16} /> Células Rise</span>
          <h2 id="cell-preview-title">A igreja também acontece perto de você.</h2>
          <p>Casas abertas, conversas sinceras e uma comunidade para caminhar junto durante a semana.</p>
          <Link href="/celulas" className="button button-light">Encontrar uma célula <MapPin size={18} /></Link>
        </div>
        <div className="cell-constellation" aria-label="Palavra, comunhão e oração nas células Rise">
          <div className="cell-core"><Flame /><strong>Células</strong><span>Rise</span></div>
          <span className="cell-pill pill-one">Palavra</span>
          <span className="cell-pill pill-two">Comunhão</span>
          <span className="cell-pill pill-three">Oração</span>
          <span className="cell-line line-one" aria-hidden="true" />
          <span className="cell-line line-two" aria-hidden="true" />
          <span className="cell-line line-three" aria-hidden="true" />
        </div>
      </section>

      <section className="section-shell instagram-stage" aria-labelledby="instagram-title">
        <div className="instagram-images" aria-hidden="true">
          <img src="/assets/jovens-rise.jpeg" alt="" />
          <img src="/assets/camiseta-rise-03.jpeg" alt="" />
          <img src="/assets/camiseta-rise-01.jpeg" alt="" />
        </div>
        <div className="instagram-copy">
          <span className="eyebrow"><Camera size={16} /> Siga o movimento</span>
          <h2 id="instagram-title">O Rise continua no seu feed.</h2>
          <p>Acompanhe encontros, avisos, bastidores, novas coleções e tudo o que está acontecendo no coletivo.</p>
          <a href="https://www.instagram.com/coletivo_rise/" target="_blank" rel="noreferrer" className="instagram-handle">
            <span>@coletivo_rise</span><ArrowUpRight />
          </a>
          <a href="https://wa.me/5511968778688" target="_blank" rel="noreferrer" className="instagram-whatsapp"><MessageCircle /> Falar com a equipe no WhatsApp</a>
        </div>
      </section>

      <section className="manifesto-band" aria-label="Manifesto Rise">
        <div className="manifesto-track">
          <span>Levanta-te</span><Flame /><span>Resplandece</span><Sparkles /><span>Viva</span><Flame />
          <span>Levanta-te</span><Flame /><span>Resplandece</span><Sparkles /><span>Viva</span><Flame />
        </div>
      </section>

      <section className="section-shell final-cta">
        <div>
          <span className="eyebrow light"><Flame size={16} /> Seu lugar é aqui</span>
          <h2>Quer fazer parte do que Deus está fazendo no Rise?</h2>
        </div>
        <Link href="/inscricao" className="button button-light">Quero viver isso <ArrowUpRight size={18} /></Link>
      </section>
    </main>
  );
}
