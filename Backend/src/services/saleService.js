import Sale from "../models/Sale.js";
import SaleItem from "../models/SaleItem.js";
import Product from "../models/Product.js";
import CreditAccount from "../models/CreditAccount.js";
import CreditAccountItem from "../models/CreditAccountItem.js";
import { AppError } from "../errors/appError.js";
import { sequelize } from "../config/database.js";

export const create = async (data) => {
  const { paymentMethod, creditAccountId, items } = data;

  // Validate credit account
  if (paymentMethod === "CUENTA_CORRIENTE") {
    if (!creditAccountId) {
      throw new AppError("creditAccountId is required for CUENTA_CORRIENTE", 400);
    }
    const account = await CreditAccount.findByPk(creditAccountId);
    if (!account) {
      throw new AppError("Credit account not found", 404);
    }
  } else if (creditAccountId) {
    throw new AppError("creditAccountId should only be set for CUENTA_CORRIENTE", 400);
  }

  // Process items and calculate totals
  const processedItems = [];
  let total = 0;

  for (const item of items) {
    if (item.type === "catalog") {
      const product = await Product.findByPk(item.productId);
      if (!product) {
        throw new AppError(`Product with id ${item.productId} not found`, 404);
      }
      const unitPriceAtSale = parseFloat(product.price);
      const subtotal = unitPriceAtSale * item.quantity;
      processedItems.push({
        productId: product.id,
        customName: null,
        quantity: item.quantity,
        unitPriceAtSale,
        subtotal,
      });
      total += subtotal;
    } else {
      // Custom item (product from scale)
      processedItems.push({
        productId: null,
        customName: item.customName,
        quantity: 1,
        unitPriceAtSale: item.subtotal,
        subtotal: item.subtotal,
      });
      total += item.subtotal;
    }
  }

  // Create sale in transaction
  const transaction = await sequelize.transaction();
  try {
    const sale = await Sale.create(
      {
        total,
        paymentMethod,
        creditAccountId: paymentMethod === "CUENTA_CORRIENTE" ? creditAccountId : null,
      },
      { transaction }
    );

    for (const item of processedItems) {
      await SaleItem.create(
        {
          saleId: sale.id,
          ...item,
        },
        { transaction }
      );
    }

    // If credit account, create CreditAccountItem and update balance
    if (paymentMethod === "CUENTA_CORRIENTE") {
      await CreditAccountItem.create(
        {
          creditAccountId,
          saleId: sale.id,
          amount: total,
          date: new Date(),
        },
        { transaction }
      );

      await CreditAccount.increment("balance", {
        by: total,
        where: { id: creditAccountId },
        transaction,
      });
    }

    await transaction.commit();

    // Return sale with items
    return await Sale.findByPk(sale.id, {
      include: [
        {
          model: SaleItem,
          include: [{ model: Product, attributes: ["id", "name", "saleType"] }],
        },
        { model: CreditAccount, attributes: ["id", "name"] },
      ],
    });
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

export const getAll = async () => {
  return await Sale.findAll({
    include: [
      {
        model: SaleItem,
        include: [{ model: Product, attributes: ["id", "name", "saleType"] }],
      },
      { model: CreditAccount, attributes: ["id", "name"] },
    ],
    order: [["date", "DESC"]],
  });
};

export const getById = async (id) => {
  const sale = await Sale.findByPk(id, {
    include: [
      {
        model: SaleItem,
        include: [{ model: Product, attributes: ["id", "name", "saleType"] }],
      },
      { model: CreditAccount, attributes: ["id", "name"] },
    ],
  });
  if (!sale) throw new AppError("Sale not found", 404);
  return sale;
};
