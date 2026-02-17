import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import paymentsRoutes from "./routes/payments.routes.js";
import webhooksRoutes from "./routes/webhooks.routes.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api", paymentsRoutes);
app.use("/webhooks", webhooksRoutes);

const port = Number(process.env.PORT || 3001);
app.listen(port, () => console.log(`API rodando na porta ${port}`));
