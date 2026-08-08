import "dotenv/config";
import bcrypt from "bcryptjs";
import { sequelize } from "../../src/config/database.js";
import User from "../../src/models/User.js";

async function seed() {
  try {
    await sequelize.authenticate();
    console.log("Database connected");

    const vendorPassword = process.env.VENDOR_PASSWORD;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!vendorPassword || !adminPassword) {
      throw new Error("VENDOR_PASSWORD and ADMIN_PASSWORD must be set in .env");
    }

    const vendorHash = await bcrypt.hash(vendorPassword, 10);
    const adminHash = await bcrypt.hash(adminPassword, 10);

    await sequelize.sync();

    const [vendor, createdVendor] = await User.findOrCreate({
      where: { username: "Mostrador" },
      defaults: {
        username: "Mostrador",
        passwordHash: vendorHash,
        role: "vendedor",
      },
    });

    const [admin, createdAdmin] = await User.findOrCreate({
      where: { username: "Barbara" },
      defaults: {
        username: "Barbara",
        passwordHash: adminHash,
        role: "administrador",
      },
    });

    console.log(`Vendedor: ${createdVendor ? "created" : "already exists"}`);
    console.log(`Admin: ${createdAdmin ? "created" : "already exists"}`);

    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
}

seed();
