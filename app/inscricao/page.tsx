import type { Metadata } from "next";
import { CheckCircle2, Flame, LockKeyhole } from "lucide-react";
import { RegistrationForm } from "../components/registration-form";

export const metadata: Metadata = {
  title: "Inscrição Acampamento 2027",
  description: "Faça sua inscrição para o Acampamento Rise 2027.",
};

export default function InscricaoPage() {
  return (
    <main className="form-page">
      <section className="form-hero">
        <div className="section-shell">
          <span className="hero-kicker"><Flame size={16} /> Inscrição Acampamento Rise 2027</span>
          <h1>Seu próximo passo <em>começa aqui.</em></h1>
          <p>Preencha com atenção. Os 10 primeiros lugares custam R$ 400,00; depois, o valor passa a R$ 450,00. O presskit é opcional por R$ 60,00.</p>
          <div className="form-trust"><span><CheckCircle2 /> Informações organizadas</span><span><LockKeyhole /> Envio seguro</span></div>
        </div>
      </section>
      <section className="section-shell form-shell">
        <div className="form-intro"><div><span className="eyebrow">Formulário</span><h2>Conte um pouco sobre você.</h2></div><p><strong>1º lote:</strong> R$ 400,00 para as 10 primeiras vagas.<br /><strong>Próximas vagas:</strong> R$ 450,00.<br /><strong>Presskit opcional:</strong> + R$ 60,00.</p></div>
        <RegistrationForm />
      </section>
    </main>
  );
}

