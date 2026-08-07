import "dotenv/config";
import express from "express";
import cors from "cors";
import { sequelize } from "./config/database.js";
import productRoutes from "./routes/productRoutes.js";
import { globalErrorHandler } from "./errors/error.controller.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/products", productRoutes);

app.use(globalErrorHandler);

async function start() {
  try {
    await sequelize.authenticate();
    console.log("Database connected");
    await sequelize.sync();
    console.log("Models synced");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();
