// Input validation schemas
import { z } from 'zod';

// Common validators
export const validators = {
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').regex(/[A-Z]/, 'Password must contain uppercase letter').regex(/[0-9]/, 'Password must contain number').regex(/[^a-zA-Z0-9]/, 'Password must contain special character'),
  uuid: z.string().uuid('Invalid UUID'),
  url: z.string().url('Invalid URL'),
  phoneNumber: z.string().regex(/^[\d\-\(\) ]+$/, 'Invalid phone number'),
};

// Auth schemas
export const authSchemas = {
  login: z.object({
    email: validators.email,
    password: z.string().min(1, 'Password required'),
  }),
  register: z.object({
    email: validators.email,
    password: validators.password,
    confirmPassword: z.string(),
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  }).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }),
  resetPassword: z.object({
    email: validators.email,
  }),
  changePassword: z.object({
    currentPassword: z.string().min(1, 'Current password required'),
    newPassword: validators.password,
    confirmPassword: z.string(),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }),
};

// Utility function to validate and parse input
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(error.issues);
    }
    throw error;
  }
}

export class ValidationError extends Error {
  constructor(public errors: z.ZodIssue[]) {
    super('Validation failed');
    this.name = 'ValidationError';
  }
}
