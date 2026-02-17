import { z } from "zod";

const onlyDigits = (v) => (v ?? "").toString().replace(/\D/g, "");

export const createPaymentSchema = z.object({
  amount: z.number().min(10, "amount mínimo é 10.00"),
  description: z.string().max(200).optional(),
  customer_name: z.string().max(100).optional(),
  customer_cpf: z
    .string()
    .transform(onlyDigits)
    .refine((v) => v.length === 0 || v.length === 11 || v.length === 14, "customer_cpf deve ter 11 (CPF) ou 14 (CNPJ) dígitos")
    .optional(),
  customer_email: z.string().email().max(255).optional(),
  customer_phone: z.string().max(20).optional(),
  customer_address: z.string().max(500).optional(),
  external_id: z.string().max(50).optional(),

  // Se você quiser permitir o front mandar um webhook_url específico, deixe.
  // Se não, você pode remover esse campo e sempre setar via env.
  webhook_url: z.string().url().optional()
});

export function zodValidate(schema) {
  return (req, res, next) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: "VALIDATION_ERROR",
        issues: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message }))
      });
    }
    req.validated = parsed.data;
    next();
  };
}
