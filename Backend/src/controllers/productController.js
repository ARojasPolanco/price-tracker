import { catchAsync } from "../errors/catchAsync.js";
import * as productService from "../services/productService.js";

export const list = catchAsync(async (req, res) => {
  const products = await productService.getAll(req.query.search, req.query.categoryId);
  res.json(products);
});

export const getProductById = catchAsync(async (req, res) => {
  const product = await productService.getById(req.params.id);
  res.json(product);
});

export const create = catchAsync(async (req, res) => {
  const product = await productService.create(req.body);
  res.status(201).json(product);
});

export const update = catchAsync(async (req, res) => {
  const product = await productService.update(req.params.id, req.body);
  res.json(product);
});

export const remove = catchAsync(async (req, res) => {
  await productService.remove(req.params.id);
  res.status(204).end();
});
