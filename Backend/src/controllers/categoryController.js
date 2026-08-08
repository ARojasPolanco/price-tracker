import { catchAsync } from "../errors/catchAsync.js";
import * as categoryService from "../services/categoryService.js";

export const list = catchAsync(async (req, res) => {
  const categories = await categoryService.getAll();
  res.json(categories);
});

export const getCategoryById = catchAsync(async (req, res) => {
  const category = await categoryService.getById(req.params.id);
  res.json(category);
});

export const create = catchAsync(async (req, res) => {
  const category = await categoryService.create(req.body);
  res.status(201).json(category);
});

export const update = catchAsync(async (req, res) => {
  const category = await categoryService.update(req.params.id, req.body);
  res.json(category);
});

export const remove = catchAsync(async (req, res) => {
  await categoryService.remove(req.params.id);
  res.status(204).end();
});
