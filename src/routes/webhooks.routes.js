import { Router } from "express";
import { createPixgoClient } from "../services/pixgo.client.js";

const router = Router();
const pixgo = createPixgoClient();

// POST /webhooks/pixgo
router.post("/pixgo", (req, res) => {
  const token = process.env.PIXGO_WEBHOOK_TOKEN;
  if (token && req.query.token !== token) {
    return res.status(401).json({ success: false, error: "UNAUTHORIZED" });
  }

  // Responde rápido (PixGo tenta em até 10s e espera 2xx) :contentReference[oaicite:4]{index=4}
  res.status(200).json({ received: true });

  // Processa depois da resposta
  setImmediate(async () => {
    try {
      const payload = req.body;
      if (!payload?.event || !payload?.data?.payment_id) return;

      // Dica da doc: para pagamentos críticos, confirmar via status endpoint :contentReference[oaicite:5]{index=5}
      const paymentId = payload.data.payment_id;
      const statusResp = await pixgo.get(`/payment/${paymentId}/status`).catch(() => null);

      console.log("[WEBHOOK]", {
        event: payload.event,
        payment_id: paymentId,
        external_id: payload.data.external_id,
        amount: payload.data.amount,
        status_from_webhook: payload.data.status,
        status_confirmed: statusResp?.data?.data?.status
      });

      // Aqui você atualiza seu banco/pedido:
      // if (payload.event === "payment.completed") marcarPedidoComoPago(payload.data.external_id)
      // if (payload.event === "payment.expired") cancelarPedido(payload.data.external_id)
    } catch (e) {
      console.error("Erro processando webhook:", e?.message || e);
    }
  });
});

export default router;
