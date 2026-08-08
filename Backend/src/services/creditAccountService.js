import CreditAccount from "../models/CreditAccount.js";
import CreditAccountItem from "../models/CreditAccountItem.js";
import { AppError } from "../errors/appError.js";
import { sequelize } from "../config/database.js";

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

export const getClosure = async (id) => {
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

  return {
    id: account.id,
    name: account.name,
    balance: account.balance,
    items: account.CreditAccountItems || [],
  };
};

export const settle = async (id) => {
  const account = await CreditAccount.findByPk(id);
  if (!account) throw new AppError("Credit account not found", 404);

  const balance = parseFloat(account.balance);
  if (balance === 0) {
    throw new AppError("Account has no pending balance", 400);
  }

  const transaction = await sequelize.transaction();
  try {
    // Archive all active items
    await CreditAccountItem.update(
      { archived: true, settledAt: new Date() },
      {
        where: { creditAccountId: id, archived: false },
        transaction,
      }
    );

    // Reset balance to 0
    await account.update({ balance: 0 }, { transaction });

    await transaction.commit();

    return await CreditAccount.findByPk(id, {
      include: [
        {
          model: CreditAccountItem,
          where: { archived: false },
          required: false,
        },
      ],
    });
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};
