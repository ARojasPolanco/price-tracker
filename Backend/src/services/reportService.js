import { Op, fn, col, literal } from "sequelize";
import Sale from "../models/Sale.js";
import SaleItem from "../models/SaleItem.js";
import Expense from "../models/Expense.js";
import Invoice from "../models/Invoice.js";
import CreditAccount from "../models/CreditAccount.js";
import CreditAccountItem from "../models/CreditAccountItem.js";

function getDateRange(period, startDate, endDate) {
  const now = new Date();
  let start, end;

  if (startDate && endDate) {
    start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  switch (period) {
    case "diario":
      start = new Date(now);
      start.setHours(0, 0, 0, 0);
      end = new Date(now);
      end.setHours(23, 59, 59, 999);
      break;
    case "semanal":
      start = new Date(now);
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      end = new Date(now);
      end.setHours(23, 59, 59, 999);
      break;
    case "quincenal":
      start = new Date(now);
      start.setDate(start.getDate() - 15);
      start.setHours(0, 0, 0, 0);
      end = new Date(now);
      end.setHours(23, 59, 59, 999);
      break;
    case "mensual":
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      start.setHours(0, 0, 0, 0);
      end = new Date(now);
      end.setHours(23, 59, 59, 999);
      break;
    default:
      start = new Date(now);
      start.setHours(0, 0, 0, 0);
      end = new Date(now);
      end.setHours(23, 59, 59, 999);
  }

  return { start, end };
}

export const getSalesReport = async (period, startDate, endDate) => {
  const { start, end } = getDateRange(period, startDate, endDate);

  const sales = await Sale.findAll({
    where: {
      date: { [Op.between]: [start, end] },
    },
    attributes: [
      [fn("DATE", col("date")), "date"],
      [fn("SUM", col("total")), "total"],
      [fn("COUNT", col("id")), "count"],
    ],
    group: [fn("DATE", col("date"))],
    order: [[fn("DATE", col("date")), "ASC"]],
    raw: true,
  });

  const total = sales.reduce((sum, s) => sum + parseFloat(s.total), 0);

  return {
    period,
    startDate: start,
    endDate: end,
    total,
    byDate: sales,
  };
};

export const getIncomeReport = async (period, startDate, endDate) => {
  const { start, end } = getDateRange(period, startDate, endDate);

  // Sales in cash methods (counted at sale date)
  const salesIncome = await Sale.findAll({
    where: {
      date: { [Op.between]: [start, end] },
      paymentMethod: { [Op.in]: ["EFECTIVO", "MERCADO_PAGO", "CUENTA_DNI"] },
    },
    attributes: [
      [fn("DATE", col("date")), "date"],
      [fn("SUM", col("total")), "total"],
    ],
    group: [fn("DATE", col("date"))],
    order: [[fn("DATE", col("date")), "ASC"]],
    raw: true,
  });

  // Credit account settlements (counted at settledAt date)
  const settlements = await CreditAccountItem.findAll({
    where: {
      archived: true,
      settledAt: { [Op.between]: [start, end] },
    },
    attributes: [
      [fn("DATE", col("settledAt")), "date"],
      [fn("SUM", col("amount")), "total"],
    ],
    group: [fn("DATE", col("settledAt"))],
    order: [[fn("DATE", col("settledAt")), "ASC"]],
    raw: true,
  });

  // Merge by date
  const byDate = {};
  for (const s of salesIncome) {
    const date = s.date;
    byDate[date] = (byDate[date] || 0) + parseFloat(s.total);
  }
  for (const s of settlements) {
    const date = s.date;
    byDate[date] = (byDate[date] || 0) + parseFloat(s.total);
  }

  const result = Object.entries(byDate)
    .map(([date, total]) => ({ date, total }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const total = result.reduce((sum, r) => sum + r.total, 0);

  return {
    period,
    startDate: start,
    endDate: end,
    total,
    byDate: result,
  };
};

export const getExpensesReport = async (period, startDate, endDate) => {
  const { start, end } = getDateRange(period, startDate, endDate);

  const expenses = await Expense.findAll({
    where: {
      date: { [Op.between]: [start, end] },
    },
    attributes: [
      [fn("DATE", col("date")), "date"],
      [fn("SUM", col("amount")), "total"],
      [fn("COUNT", col("id")), "count"],
    ],
    group: [fn("DATE", col("date"))],
    order: [[fn("DATE", col("date")), "ASC"]],
    raw: true,
  });

  const total = expenses.reduce((sum, e) => sum + parseFloat(e.total), 0);

  return {
    period,
    startDate: start,
    endDate: end,
    total,
    byDate: expenses,
  };
};

export const getInvoicesReport = async () => {
  const pending = await Invoice.findAll({
    where: { status: "PENDIENTE" },
    attributes: [[fn("SUM", col("amount")), "total"], [fn("COUNT", col("id")), "count"]],
    raw: true,
  });

  const paid = await Invoice.findAll({
    where: { status: "PAGADA" },
    attributes: [[fn("SUM", col("amount")), "total"], [fn("COUNT", col("id")), "count"]],
    raw: true,
  });

  return {
    pending: {
      total: parseFloat(pending[0].total || 0),
      count: parseInt(pending[0].count || 0),
    },
    paid: {
      total: parseFloat(paid[0].total || 0),
      count: parseInt(paid[0].count || 0),
    },
  };
};

export const getPendingCreditAccounts = async () => {
  return await CreditAccount.findAll({
    where: {
      balance: { [Op.gt]: 0 },
    },
    order: [["balance", "DESC"]],
  });
};
