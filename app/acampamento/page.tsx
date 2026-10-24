import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, CalendarDays, Camera, Flame, Heart, MapPin, Music2, Sparkles, UsersRound } from "lucide-react";
import { CampMemoryGallery } from "../components/camp-memory-gallery";
import { SectionHero } from "../components/section-hero";

export const metadata: Metadata = {
  title: "Acampamento Rise",
  description: "Três dias de descanso, adoração, comunhão e transformação com o Coletivo Rise.",
};

const schedule = [
  { day: "01", title: "Abertura", icon: UsersRound, text: "Recepção, louvor, palavra de boas-vindas e atividades de integração." },
  { day: "02", title: "Adoração", icon: Music2, text: "Momentos de oração, ensino profundo e comunhão entre os jovens." },
  { day: "03", title: "Envio", icon: Flame, text: "Celebração, compromissos e envio para viver o propósito no dia a dia." },
];

export default function AcampamentoPage() {
  return (
    <main>
      <SectionHero
        eyebrow="Próximo Acampamento • 2027"
        title={<>2027 começa com <em>uma nova história.</em></>}
        description="O próximo Acampamento Rise já está no horizonte: descanso, adoração, ensino e comunhão em uma imersão criada para encontros reais com Deus."
        icon={Flame}
      >
        <a href="#programacao" className="button button-ghost">Ver programação</a>
      </SectionHero>

      <section className="section-shell program-section" id="programacao">
        <div className="section-heading split-heading">
          <div>
            <span className="eyebrow"><CalendarDays size={16} /> Programação</span>
            <h2>Um caminho em três atos.</h2>
          </div>
          <p>Cada dia foi pensado para aprofundar conexões, abrir espaço para Deus e transformar aquilo que vem depois.</p>
        </div>
        <div className="schedule-grid">
          {schedule.map((item) => {
            const Icon = item.icon;
            return (
              <article className="schedule-card" key={item.day}>
                <span className="schedule-number">{item.day}</span>
                <div className="icon-chip"><Icon /></div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="section-shell camp-gallery" aria-labelledby="gallery-title">
        <div className="gallery-copy">
          <span className="eyebrow"><Sparkles size={16} /> Memórias Rise</span>
          <h2 id="gallery-title">Conexões que continuam depois do último dia.</h2>
          <p>O acampamento é sobre estar presente: nas conversas, na adoração, nas amizades e no que Deus está construindo.</p>
          <div className="info-pills">
            <span><MapPin size={17} /> Local divulgado pela equipe</span>
            <span><UsersRound size={17} /> Vagas limitadas</span>
            <span><Heart size={17} /> Ambiente preparado com cuidado</span>
          </div>
        </div>
        <div className="gallery-mosaic">
          <img className="gallery-main" src="/assets/acampamento-memoria-01.jpg" alt="Jovens participando de uma atividade ao ar livre no acampamento" />
          <img src="/assets/acampamento-memoria-05.jpg" alt="Momento de louvor e oração no acampamento" />
          <img src="/assets/acampamento-memoria-07.jpg" alt="Amigas se abraçando durante o acampamento" />
        </div>
      </section>

      <section className="section-shell camp-memory-wall" aria-labelledby="memory-wall-title">
        <div className="camp-memory-heading">
          <div>
            <span className="eyebrow"><Camera size={16} /> Edições anteriores</span>
            <h2 id="memory-wall-title">Há momentos que uma foto não explica. <em>Mas ajuda a lembrar.</em></h2>
          </div>
          <p><BookOpen size={19} /> Palavra, cuidado, alegria e comunhão vividos de verdade.</p>
        </div>
        <CampMemoryGallery />
      </section>

      <section className="section-shell camp-experience-picker" aria-label="Escolha sua experiência no Acampamento Rise 2027">
        <div className="camp-experience-heading">
          <h2><span>Escolha sua</span><em>experiência</em></h2>
          <p>TRÊS FORMAS DE VIVER O VIVA O CAMP 2027</p>
        </div>
        <div className="camp-experience-cards">
          <article className="camp-experience-card">
            <div className="camp-experience-card-top"><span>01</span><strong>ESSENCIAL</strong></div>
            <h3>Só o <em>ingresso</em></h3>
            <p>Ingresso para o acampamento.</p>
            <Link className="camp-card-visual camp-ticket-link" href="/inscricao?kit=1" aria-label="Escolher somente o ingresso">
              <div className="camp-ticket" aria-hidden="true"><b>✦ COLETIVO<br />RISE</b><span>VIVA O<br />CAMP 2027</span></div>
            </Link>
            <div className="camp-price-pair">
              <strong className="camp-price"><small>10 PRIMEIRAS VAGAS</small>R$ 400,00</strong>
              <strong className="camp-price"><small>PRÓXIMAS VAGAS</small>R$ 450,00</strong>
            </div>
            <Link className="camp-experience-button" href="/inscricao?kit=1">Quero só o ingresso</Link>
          </article>
          <article className="camp-experience-card camp-experience-card-featured">
            <div className="camp-experience-card-top"><span>02</span><strong>COM CAMISETA</strong></div>
            <h3>Ingresso + <em>camiseta Rise</em></h3>
            <p>Ingresso para o acampamento e camiseta oversized.</p>
            <Link className="camp-card-visual" href="/inscricao?kit=2" aria-label="Escolher ingresso com camiseta">
              <div className="camp-shirt-pair"><img src="/assets/product-camiseta-branca.jpg" alt="Camiseta Rise off-white" /><img src="/assets/product-camiseta-roxa.jpg" alt="Camiseta Rise roxa" /></div>
            </Link>
            <div className="camp-choice-note">ESCOLHA A COR <span>Off-white</span><span>Roxa</span></div>
            <strong className="camp-price"><small>PREÇO</small>EM BREVE</strong>
            <Link className="camp-experience-button" href="/inscricao?kit=2">Quero ingresso + camiseta</Link>
          </article>
          <article className="camp-experience-card">
            <div className="camp-experience-card-top"><span>03</span><strong>KIT COMPLETO</strong></div>
            <h3>Ingresso + <em>kit completo Rise</em></h3>
            <p>Ingresso e kit completo com camiseta, cordão, chaveiro, pulseira, adesivos e caixa personalizada.</p>
            <Link className="camp-card-visual" href="/inscricao?kit=3" aria-label="Escolher kit completo Rise">
              <img className="camp-kit-image" src="/assets/presskit-rise-featured.jpg" alt="Kit completo Rise" />
            </Link>
            <strong className="camp-price"><small>PREÇO</small>EM BREVE</strong>
            <Link className="camp-experience-button" href="/inscricao?kit=3">Quero o kit completo</Link>
          </article>
        </div>
      </section>
    </main>
  );
}
