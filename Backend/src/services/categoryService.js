import Category from "../models/Category.js";
import { AppError } from "../errors/appError.js";

export const getAll = async () => {
  return await Category.findAll({ order: [["name", "ASC"]] });
};

export const getById = async (id) => {
  const category = await Category.findByPk(id);
  if (!category) throw new AppError("Category not found", 404);
  return category;
};

export const create = async (data) => {
  return await Category.create(data);
};

export const update = async (id, data) => {
  const category = await getById(id);
  return await category.update(data);
};

export const remove = async (id) => {
  const category = await getById(id);
  await category.destroy();
};
