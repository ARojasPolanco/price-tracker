import { Op } from "sequelize";
import Product from "../models/Product.js";
import { AppError } from "../errors/appError.js";

export const getAll = async (search) => {
  if (search) {
    return await Product.findAll({
      where: { name: { [Op.iLike]: `%${search}%` } },
      order: [["name", "ASC"]],
    });
  }
  return await Product.findAll({ order: [["name", "ASC"]] });
};

export const getById = async (id) => {
  const product = await Product.findByPk(id);
  if (!product) throw new AppError("Product not found", 404);
  return product;
};

export const create = async (data) => {
  return await Product.create(data);
};

export const update = async (id, data) => {
  const product = await getById(id);
  return await product.update(data);
};

export const remove = async (id) => {
  const product = await getById(id);
  await product.destroy();
};
