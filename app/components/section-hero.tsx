import type { LucideIcon } from "lucide-react";

export function SectionHero({ eyebrow, title, description, icon: Icon, children }: {
  eyebrow: string;
  title: React.ReactNode;
  description: string;
  icon: LucideIcon;
  children?: React.ReactNode;
}) {
  return (
    <section className="inner-hero">
      <div className="inner-hero-glow" aria-hidden="true" />
      <div className="section-shell inner-hero-content">
        <span className="hero-kicker"><Icon size={16} /> {eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
        {children && <div className="hero-actions">{children}</div>}
      </div>
    </section>
  );
}
