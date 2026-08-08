import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.number().positive("Price must be positive"),
  categoryId: z.number().int().positive().optional(),
  saleType: z.enum(["unidad", "kilo"]).optional(),
});

export const updateProductSchema = z
  .object({
    name: z.string().min(1).optional(),
    price: z.number().positive().optional(),
    categoryId: z.number().int().positive().nullable().optional(),
    saleType: z.enum(["unidad", "kilo"]).optional(),
    available: z.boolean().optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.price !== undefined ||
      data.categoryId !== undefined ||
      data.saleType !== undefined ||
      data.available !== undefined,
    { message: "At least one field is required" }
  );
