import { z } from "zod";

const cleanText = (max: number) => z.string().trim().max(max);
const requiredText = (max: number) => cleanText(max).min(1);
const phone = requiredText(24).regex(/^[0-9()+\-\s]{8,24}$/, "Telefone inválido");
const idempotencyKey = z.string().uuid();
const securityFields = {
  idempotencyKey,
  turnstileToken: requiredText(2048),
  website: cleanText(0).optional().default(""),
  consent: z.literal(true),
  privacyVersion: z.literal("2026-10"),
};

export const registrationSubmission = z.object({
  kind: z.literal("registration"),
  ...securityFields,
  nome: requiredText(120),
  idade: z.coerce.number().int().min(10).max(99),
  responsavel: cleanText(120),
  telefone: phone,
  igreja: requiredText(120),
  endereco: requiredText(160),
  alergias: cleanText(300),
  medicacao: cleanText(300),
  restricao: cleanText(300),
  participou: z.enum(["Sim", "Não"]),
  camiseta: z.enum(["PP", "P", "M", "G", "GG", "XG"]),
  pagamento: z.enum(["PIX", "Cartão", "Dinheiro", "Entrada + Parcelamento"]),
  comprovanteBase64: z.string().max(7_100_000),
  comprovanteTipo: z.enum(["", "image/jpeg", "image/png", "image/webp", "application/pdf"]),
  comprovanteNome: cleanText(180),
  obs: cleanText(1000),
});

export const shirtSubmission = z.object({
  kind: z.literal("shirt"),
  ...securityFields,
  nome: requiredText(120),
  telefone: phone,
  edition: z.enum(["Camiseta Rise — Edição 01", "Camiseta Rise — Edição 02", "Camiseta Rise — Edição 03"]),
  size: z.enum(["P", "M", "G", "GG"]),
  quantity: z.coerce.number().int().min(1).max(5),
  pagamento: z.enum(["PIX", "Cartão", "Dinheiro"]),
});

export const submissionSchema = z.discriminatedUnion("kind", [registrationSubmission, shirtSubmission]).superRefine((data, context) => {
  if (data.kind !== "registration") return;
  if (data.idade < 18 && !data.responsavel) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["responsavel"],
      message: "Informe o responsável pelo participante menor de idade.",
    });
  }
  if (data.comprovanteBase64 && (!data.comprovanteNome || !data.comprovanteTipo)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["comprovanteBase64"],
      message: "O comprovante está incompleto.",
    });
  }
});
export type Submission = z.infer<typeof submissionSchema>;
