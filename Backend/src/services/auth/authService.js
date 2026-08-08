import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../../models/User.js";
import { AppError } from "../../errors/appError.js";

export const login = async (username, password) => {
  const user = await User.findOne({ where: { username } });
  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const validPassword = await bcrypt.compare(password, user.passwordHash);
  if (!validPassword) {
    throw new AppError("Invalid credentials", 401);
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
    },
  };
};
