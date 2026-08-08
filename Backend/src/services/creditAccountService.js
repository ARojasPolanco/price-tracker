import CreditAccount from "../models/CreditAccount.js";
import CreditAccountItem from "../models/CreditAccountItem.js";
import { AppError } from "../errors/appError.js";

export const getAll = async () => {
  return await CreditAccount.findAll({
    order: [["name", "ASC"]],
  });
};

export const getById = async (id) => {
  const account = await CreditAccount.findByPk(id, {
    include: [
      {
        model: CreditAccountItem,
        where: { archived: false },
        required: false,
        order: [["date", "DESC"]],
      },
    ],
  });
  if (!account) throw new AppError("Credit account not found", 404);
  return account;
};

export const create = async (data) => {
  return await CreditAccount.create(data);
};
