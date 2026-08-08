import { catchAsync } from "../errors/catchAsync.js";
import * as saleService from "../services/saleService.js";

export const create = catchAsync(async (req, res) => {
  const sale = await saleService.create(req.body);
  res.status(201).json(sale);
});

export const list = catchAsync(async (req, res) => {
  const sales = await saleService.getAll();
  res.json(sales);
});

export const getSaleById = catchAsync(async (req, res) => {
  const sale = await saleService.getById(req.params.id);
  res.json(sale);
});
