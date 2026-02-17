import { Router } from "express";
import { createPixgoClient } from "../services/pixgo.client.js";
import { createPaymentSchema, zodValidate } from "../utils/validators.js";

const router = Router();
const pixgo = createPixgoClient();

function buildWebhookUrl() {
  const base = process.env.PUBLIC_BASE_URL;
  if (!base) return undefined;

  const token = process.env.PIXGO_WEBHOOK_TOKEN;
  const url = new URL("/webhooks/pixgo", base);
  if (token) url.searchParams.set("token", token);
  return url.toString();
}

// POST /api/payments -> cria pagamento e devolve qr_code/qr_image_url/etc
router.post("/payments", zodValidate(createPaymentSchema), async (req, res) => {
  const body = { ...req.validated };

  // Se o front não mandar webhook_url, a gente injeta automaticamente:
  if (!body.webhook_url) {
    const wh = buildWebhookUrl();
    if (wh) body.webhook_url = wh;
  }

  try {
    const r = await pixgo.post("/payment/create", body);
    return res.status(r.status).json(r.data);
  } catch (err) {
    const status = err.response?.status || 500;
    return res.status(status).json(err.response?.data || { success: false, error: "PIXGO_ERROR" });
  }
});

// GET /api/payments/:id/status
router.get("/payments/:id/status", async (req, res) => {
  try {
    const r = await pixgo.get(`/payment/${req.params.id}/status`);
    return res.status(r.status).json(r.data);
  } catch (err) {
    const status = err.response?.status || 500;
    return res.status(status).json(err.response?.data || { success: false, error: "PIXGO_ERROR" });
  }
});

// GET /api/payments/:id (detalhes completos)
router.get("/payments/:id", async (req, res) => {
  try {
    const r = await pixgo.get(`/payment/${req.params.id}`);
    return res.status(r.status).json(r.data);
  } catch (err) {
    const status = err.response?.status || 500;
    return res.status(status).json(err.response?.data || { success: false, error: "PIXGO_ERROR" });
  }
});

export default router;
