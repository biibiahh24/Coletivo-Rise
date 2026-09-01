import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, Flame, Heart, MapPin, Music2, Sparkles, UsersRound } from "lucide-react";
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
        <Link href="/inscricao" className="button button-light">Inscrição Acampa 2027 <ArrowUpRight size={18} /></Link>
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
          <img className="gallery-main" src="/assets/jovens-rise.jpeg" alt="Jovens reunidos no Coletivo Rise" />
          <img src="/assets/camiseta-rise-03.jpeg" alt="Jovens usando a coleção Rise" />
          <img src="/assets/camiseta-rise-01.jpeg" alt="Camiseta do Coletivo Rise" />
        </div>
      </section>

      <section className="section-shell final-cta">
        <div>
          <span className="eyebrow light"><Flame size={16} /> Acampamento 2027</span>
          <h2>Sua próxima história pode começar em 2027.</h2>
        </div>
        <Link href="/inscricao" className="button button-light">Fazer minha inscrição <ArrowUpRight size={18} /></Link>
      </section>
    </main>
  );
}
