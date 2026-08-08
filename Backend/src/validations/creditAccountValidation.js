import { z } from "zod";

export const createCreditAccountSchema = z.object({
  name: z.string().min(1, "Name is required"),
});
