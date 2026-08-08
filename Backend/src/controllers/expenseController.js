import { catchAsync } from "../errors/catchAsync.js";
import * as expenseService from "../services/expenseService.js";

export const list = catchAsync(async (req, res) => {
  const expenses = await expenseService.getAll();
  res.json(expenses);
});

export const getExpenseById = catchAsync(async (req, res) => {
  const expense = await expenseService.getById(req.params.id);
  res.json(expense);
});

export const create = catchAsync(async (req, res) => {
  const expense = await expenseService.create(req.body);
  res.status(201).json(expense);
});

export const remove = catchAsync(async (req, res) => {
  await expenseService.remove(req.params.id);
  res.status(204).end();
});
