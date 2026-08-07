import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.number().positive("Price must be positive"),
});

export const updateProductSchema = z
  .object({
    name: z.string().min(1).optional(),
    price: z.number().positive().optional(),
  })
  .refine((data) => data.name !== undefined || data.price !== undefined, {
    message: "At least one field (name or price) is required",
  });
