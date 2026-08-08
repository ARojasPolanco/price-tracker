import Invoice from "../models/Invoice.js";
import { AppError } from "../errors/appError.js";

export const getAll = async () => {
  return await Invoice.findAll({ order: [["date", "DESC"]] });
};

export const getById = async (id) => {
  const invoice = await Invoice.findByPk(id);
  if (!invoice) throw new AppError("Invoice not found", 404);
  return invoice;
};

export const create = async (data) => {
  return await Invoice.create(data);
};

export const markAsPaid = async (id) => {
  const invoice = await getById(id);
  if (invoice.status === "PAGADA") {
    throw new AppError("Invoice is already paid", 400);
  }
  return await invoice.update({ status: "PAGADA", paidAt: new Date() });
};

export const remove = async (id) => {
  const invoice = await getById(id);
  await invoice.destroy();
};
