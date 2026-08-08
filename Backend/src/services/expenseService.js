import Expense from "../models/Expense.js";
import { AppError } from "../errors/appError.js";

export const getAll = async () => {
  return await Expense.findAll({ order: [["date", "DESC"]] });
};

export const getById = async (id) => {
  const expense = await Expense.findByPk(id);
  if (!expense) throw new AppError("Expense not found", 404);
  return expense;
};

export const create = async (data) => {
  return await Expense.create(data);
};

export const remove = async (id) => {
  const expense = await getById(id);
  await expense.destroy();
};
