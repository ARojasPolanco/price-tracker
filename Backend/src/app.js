import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import routes from "./routes/routes.js";
import { globalErrorHandler } from "./errors/error.controller.js";

const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.ALLOWED_ORIGIN
        : "*",
  })
);

// Global rate limiter: 100 req/min
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { error: "Too many requests, try again later" },
});
app.use(globalLimiter);

// Stricter limiter for login: 5 req/min
const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: "Too many login attempts, try again later" },
});
app.use("/api/v1/auth/login", loginLimiter);

// Body parser
app.use(express.json());

// Health check
app.get("/api/v1/health", (req, res) => {
  res.json({ status: "ok" });
});

// Routes
app.use("/api/v1", routes);

// Global error handler
app.use(globalErrorHandler);

export default app;
