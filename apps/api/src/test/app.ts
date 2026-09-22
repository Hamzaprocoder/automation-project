import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import authRoutes from "../modules/auth/auth.routes";
import organizationRoutes from "../modules/organization/organization.routes";
import customerRoutes from "../modules/customers/customer.routes";
import dashboardRoutes from "../modules/dashboard/dashboard.routes";
import conversationRoutes from "../modules/conversations/conversation.routes";
import serviceRoutes from "../modules/services/service.routes";
import appointmentRoutes from "../modules/appointments/appointment.routes";
import orderRoutes from "../modules/orders/order.routes";
import notificationRoutes from "../modules/notifications/notification.routes";
import auditRoutes from "../modules/audit/audit.routes";
import automationRoutes from "../modules/automations/automation.routes";
import analyticsRoutes from "../modules/analytics/analytics.routes";

dotenv.config();

export function createTestApp() {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());

  app.use("/api/auth", authRoutes);
  app.use("/api/organization", organizationRoutes);
  app.use("/api/customers", customerRoutes);
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/conversations", conversationRoutes);
  app.use("/api/services", serviceRoutes);
  app.use("/api/appointments", appointmentRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/audit-logs", auditRoutes);
  app.use("/api/automations", automationRoutes);
  app.use("/api/analytics", analyticsRoutes);

  return app;
}
