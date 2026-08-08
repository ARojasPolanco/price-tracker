import { z } from "zod";

export const createInvoiceSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  supplier: z.string().min(1, "Supplier is required"),
  concept: z.string().min(1, "Concept is required"),
  category: z.string().optional(),
  invoiceNumber: z.string().optional(),
  date: z.string().datetime().optional(),
});
