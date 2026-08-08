import { z } from "zod";

const catalogItemSchema = z.object({
  type: z.literal("catalog"),
  productId: z.number().int().positive(),
  quantity: z.number().positive("Quantity must be positive"),
});

const customItemSchema = z.object({
  type: z.literal("custom"),
  customName: z.string().min(1, "Name is required"),
  subtotal: z.number().positive("Subtotal must be positive"),
});

const saleItemSchema = z.discriminatedUnion("type", [
  catalogItemSchema,
  customItemSchema,
]);

export const createSaleSchema = z.object({
  paymentMethod: z.enum(["MERCADO_PAGO", "CUENTA_DNI", "EFECTIVO", "CUENTA_CORRIENTE"]),
  creditAccountId: z.number().int().positive().nullable().optional(),
  items: z.array(saleItemSchema).min(1, "At least one item is required"),
});
