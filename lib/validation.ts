import { z } from 'zod';
export const profileSchema = z.object({
  age: z.number().int().min(0).max(120).optional(),
  state: z.string().trim().min(2).max(80).optional(),
  annualIncome: z.number().min(0).max(1e10).optional(),
  occupation: z.string().trim().min(2).max(80).optional(),
  gender: z.enum(['female', 'male', 'other']).optional(),
  category: z.string().trim().min(1).max(40).optional(),
  hasDisability: z.boolean().optional(), isStudent: z.boolean().optional(), ownsLand: z.boolean().optional(),
}).strict();
export const chatSchema = z.object({
  text: z.string().trim().min(1).max(2000),
  language: z.enum(['en', 'hi', 'te']).default('en'),
  profile: profileSchema.default({}),
  history: z.array(z.object({role: z.enum(['user','assistant']), content: z.string().max(4000)}).strict()).max(12).default([]),
}).strict();