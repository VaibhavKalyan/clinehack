import { z } from 'zod';
import { LANGUAGE_CODES } from './contracts';
export const profileSchema = z.object({
  age: z.number().int().min(0).max(120).optional(),
  state: z.string().trim().min(2).max(80).optional(),
  district: z.string().trim().min(2).max(80).optional(),
  annualIncome: z.number().min(0).max(1e10).optional(),
  occupation: z.string().trim().min(2).max(80).optional(),
  gender: z.enum(['female', 'male', 'other']).optional(),
  category: z.string().trim().min(1).max(40).optional(),
  hasDisability: z.boolean().optional(), isStudent: z.boolean().optional(), ownsLand: z.boolean().optional(),
}).strict();
export const chatSchema = z.object({
  text: z.string().trim().min(1).max(2000),
  language: z.enum(LANGUAGE_CODES).default('en'),
  profile: profileSchema.default({}),
  history: z.array(z.object({role: z.enum(['user','assistant']), content: z.string().max(4000)}).strict()).max(12).default([]),
}).strict();

const emailField = z.string().trim().toLowerCase().max(120).regex(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, 'invalid email');

export const registerSchema = z.object({
  name: z.string().trim().min(1).max(60),
  email: emailField,
  password: z.string().min(8).max(128),
}).strict();

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1).max(128),
}).strict();

export const profilePutSchema = z.object({
  profile: profileSchema,
  language: z.enum(LANGUAGE_CODES),
}).strict();

export const applicationSchema = z.object({
  schemeId: z.string().trim().min(2).max(100),
  status: z.enum(['saved', 'applied']),
}).strict();

export const accountSchema = z.object({
  name: z.string().trim().min(1).max(60),
}).strict();

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: z.string().min(8).max(128),
}).strict();