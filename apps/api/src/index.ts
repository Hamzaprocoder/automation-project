import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/auth.routes";
import organizationRoutes from "./modules/organization/organization.routes";
import customerRoutes from "./modules/customers/customer.routes";
import whatsappRoutes from "./modules/whatsapp/whatsapp.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";

const app = express();
const PORT = Number(process.env.PORT ?? 4000);

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL ?? "http://localhost:3000", credentials: true }));
app.use("/api/webhooks/whatsapp", express.json({
  limit: "1mb",
  verify: (req, _res, buf) => {
    req.rawBody = Buffer.from(buf);
  },
}));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.get("/health", (_req, res) => res.json({
  status: "ok",
  message: "WhatsApp Business CRM API is running",
  timestamp: new Date().toISOString(),
}));

app.use("/api/auth", authRoutes);
app.use("/api/organization", organizationRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/webhooks/whatsapp", whatsappRoutes);

app.listen(PORT, () => console.log(`API server running on http://localhost:${PORT}`));
