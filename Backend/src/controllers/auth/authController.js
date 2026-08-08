import { catchAsync } from "../../errors/catchAsync.js";
import * as authService from "../../services/auth/authService.js";

export const login = catchAsync(async (req, res) => {
  const { username, password } = req.body;
  const result = await authService.login(username, password);
  res.json(result);
});
