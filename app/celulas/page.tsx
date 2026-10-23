import type { Metadata } from "next";
import { ArrowUpRight, Clock3, HeartHandshake, Home, MapPin, MessageCircle, Sparkles, UsersRound } from "lucide-react";
import { SectionHero } from "../components/section-hero";

export const metadata: Metadata = {
  title: "Células Rise",
  description: "Encontre uma célula do Coletivo Rise e caminhe com uma comunidade durante a semana.",
};

const rhythms = [
  { icon: Home, title: "Casas abertas", text: "Ambientes próximos e acolhedores para conversar, aprender e criar vínculos reais." },
  { icon: UsersRound, title: "Vida compartilhada", text: "Gente que celebra junto, ora junto e também caminha nos dias difíceis." },
  { icon: Sparkles, title: "Fé na rotina", text: "Palavra e propósito que continuam vivos muito além dos grandes encontros." },
];

export default function CelulasPage() {
  return (
    <main>
      <SectionHero
        eyebrow="Células Rise"
        title={<>Fé que cabe na rotina. <em>Comunhão que cabe na sala.</em></>}
        description="As células conectam jovens durante a semana para viver Palavra, oração, amizade e propósito mais de perto."
        icon={Home}
      >
        <a href="https://wa.me/5511968778688?text=Olá!%20Quero%20encontrar%20a%20célula%20Rise%20mais%20próxima." target="_blank" rel="noreferrer" className="button button-light">Encontrar minha célula <MapPin size={18} /></a>
      </SectionHero>

      <section className="section-shell cell-rhythm" aria-labelledby="cell-rhythm-title">
        <div className="section-heading split-heading">
          <div><span className="eyebrow"><HeartHandshake size={16} /> Como acontece</span><h2 id="cell-rhythm-title">Um lugar para pertencer.</h2></div>
          <p>Cada célula tem sua própria rotina, mas todas carregam o mesmo desejo: aproximar pessoas e fortalecer a caminhada com Jesus.</p>
        </div>
        <div className="challenge-grid">
          {rhythms.map((item) => {
            const Icon = item.icon;
            return <article className="challenge-card" key={item.title}><Icon /><h3>{item.title}</h3><p>{item.text}</p></article>;
          })}
        </div>
      </section>

      <section className="section-shell cell-directory cell-directory-grid" aria-labelledby="directory-title">
        <div className="cell-directory-heading"><span className="eyebrow"><Clock3 size={16} /> Encontros durante a semana</span><h2 id="directory-title">Encontre sua célula.</h2><p>Escolha uma comunidade e fale com o líder para saber os próximos encontros.</p></div>
        <div className="cell-cards">
          {[
            { name: "Ekballo", image: "/assets/celula-ekballo.jpg" },
            { name: "Rede ao Mar", image: "/assets/celula-rede-ao-mar.png" },
            { name: "Cachoeirinha", image: "/assets/encontro-rise-03.jpeg" },
          ].map(({ name, image }) => (
            <article className="cell-card" key={name}>
              <div className="cell-card-photo"><img src={image} alt={`Encontro da célula ${name}`} /></div>
              <h3>{name}</h3>
              <a href={`https://wa.me/5511968778688?text=${encodeURIComponent(`Olá! Quero falar com o líder da célula ${name}.`)}`} target="_blank" rel="noreferrer" className="button button-orange"><MessageCircle size={16} /> Falar com o líder</a>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell cells-instagram">
        <p>Agenda, encontros e novidades também estão no Instagram.</p>
        <a href="https://www.instagram.com/coletivo_rise/" target="_blank" rel="noreferrer">@coletivo_rise <ArrowUpRight /></a>
      </section>
    </main>
  );
}

