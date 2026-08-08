import { catchAsync } from "../errors/catchAsync.js";
import * as creditAccountService from "../services/creditAccountService.js";

export const list = catchAsync(async (req, res) => {
  const accounts = await creditAccountService.getAll();
  res.json(accounts);
});

export const getCreditAccountById = catchAsync(async (req, res) => {
  const account = await creditAccountService.getById(req.params.id);
  res.json(account);
});

export const create = catchAsync(async (req, res) => {
  const account = await creditAccountService.create(req.body);
  res.status(201).json(account);
});
