import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import paymentsRoutes from "./routes/payments.routes.js";
import webhooksRoutes from "./routes/webhooks.routes.js";

const app = express();

// Loga crashes “silenciosos”
process.on("unhandledRejection", (e) => console.error("unhandledRejection:", e));
process.on("uncaughtException", (e) => console.error("uncaughtException:", e));

app.set("trust proxy", 1);

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

// ✅ Railway costuma testar a raiz
app.get("/", (req, res) => res.status(200).send("ok"));

// mantém teu health
app.get("/health", (req, res) =>
  res.json({ ok: true, uptime: process.uptime() })
);

app.use("/api", paymentsRoutes);
app.use("/webhooks", webhooksRoutes);

// ✅ IMPORTANTE: usar a PORT do Railway
const port = Number(process.env.PORT || 3001);
app.listen(port, "0.0.0.0", () => console.log(`API rodando na porta ${port}`));
