import "dotenv/config";
import { sequelize } from "./config/database.js";
import app from "./app.js";

const PORT = process.env.PORT || 3000;

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
