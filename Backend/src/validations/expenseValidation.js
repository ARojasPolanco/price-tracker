import { z } from "zod";

export const createExpenseSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  concept: z.string().min(1, "Concept is required"),
  category: z.string().optional(),
  date: z.string().datetime().optional(),
});
