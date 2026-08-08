import { catchAsync } from "../errors/catchAsync.js";
import * as invoiceService from "../services/invoiceService.js";

export const list = catchAsync(async (req, res) => {
  const invoices = await invoiceService.getAll();
  res.json(invoices);
});

export const getInvoiceById = catchAsync(async (req, res) => {
  const invoice = await invoiceService.getById(req.params.id);
  res.json(invoice);
});

export const create = catchAsync(async (req, res) => {
  const invoice = await invoiceService.create(req.body);
  res.status(201).json(invoice);
});

export const markAsPaid = catchAsync(async (req, res) => {
  const invoice = await invoiceService.markAsPaid(req.params.id);
  res.json(invoice);
});

export const remove = catchAsync(async (req, res) => {
  await invoiceService.remove(req.params.id);
  res.status(204).end();
});
