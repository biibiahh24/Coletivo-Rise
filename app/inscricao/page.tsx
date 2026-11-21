import type { Metadata } from "next";
import { CheckCircle2, Flame, LockKeyhole } from "lucide-react";
import { RegistrationForm } from "../components/registration-form";

export const metadata: Metadata = {
  title: "Inscrição Acampamento 2027",
  description: "Faça sua inscrição para o Acampamento Rise 2027.",
};

export default async function InscricaoPage({ searchParams }: { searchParams: Promise<{ lote?: string; presskit?: string; kit?: string }> }) {
  const params = await searchParams;
  const initialLote = params.kit === "1" || params.lote === "primeiras" ? "10 primeiras vagas — R$ 400,00" : params.kit === "2" || params.kit === "3" || params.lote === "proximas" ? "Próximas vagas — R$ 450,00" : "";
  const initialPresskit = params.kit === "1" ? "Não" : params.kit === "3" || params.presskit === "Sim" ? "Sim" : params.presskit === "Não" ? "Não" : "";
  const initialComCamiseta = params.kit === "2" ? "Sim" : params.kit === "1" ? "Não" : "";
  return (
    <main className="form-page">
      <section className="form-hero">
        <div className="section-shell">
          <span className="hero-kicker"><Flame size={16} /> Inscrição Acampamento Rise 2027</span>
          <h1>Seu próximo passo <em>começa aqui.</em></h1>
          <p>Inscrições abertas. As 10 primeiras vagas custam R$ 400,00; depois, o valor passa a R$ 450,00. A inscrição com camiseta custa R$ 500,00. O presskit fica EM BREVE até a definição do valor.</p>
          <div className="form-trust"><span><CheckCircle2 /> Informações organizadas</span><span><LockKeyhole /> Envio seguro</span></div>
        </div>
      </section>
      <section className="section-shell form-shell">
        <div className="form-intro"><div><span className="eyebrow">Formulário</span><h2>Conte um pouco sobre você.</h2></div></div>
        <RegistrationForm initialLote={initialLote} initialPresskit={initialPresskit} initialComCamiseta={initialComCamiseta} />
      </section>
    </main>
  );
}

