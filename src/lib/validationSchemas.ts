import { z } from 'zod';

// Phone number regex: international format with optional + and 10-15 digits
const phoneRegex = /^\+?[1-9]\d{9,14}$/;

export const authLoginSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }).max(255),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).max(128),
});

export const authSignupSchema = z.object({
  fullName: z.string().trim().min(2, { message: "Name must be at least 2 characters" }).max(200),
  email: z.string().trim().email({ message: "Invalid email address" }).max(255),
  phoneNumber: z.string().trim().regex(phoneRegex, { message: "Invalid phone number format" }).max(20),
  address: z.string().trim().min(5, { message: "Address must be at least 5 characters" }).max(500),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).max(128),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const listingSchema = z.object({
  title: z.string().trim().min(5, { message: "Title must be at least 5 characters" }).max(100),
  description: z.string().trim().min(20, { message: "Description must be at least 20 characters" }).max(2000),
  price: z.number().positive({ message: "Price must be a positive number" }).max(1000000000, { message: "Price is too high" }),
  contactPhone: z.string().trim().regex(phoneRegex, { message: "Invalid phone number format" }).max(20),
  category: z.enum(['Apartment', 'House', 'Room', 'Office', 'Shop', 'Warehouse', 'Land', 'Other'], {
    errorMap: () => ({ message: "Please select a valid category" })
  }),
});

export const messageSchema = z.object({
  body: z.string().trim().min(1, { message: "Message cannot be empty" }).max(2000, { message: "Message too long (max 2000 characters)" }),
});

export const bookingSchema = z.object({
  contactName: z.string().trim().min(2, { message: "Name must be at least 2 characters" }).max(200),
  contactPhone: z.string().trim().regex(phoneRegex, { message: "Invalid phone number format" }).max(20),
  occupants: z.number().int().min(1, { message: "At least 1 occupant required" }).max(50, { message: "Too many occupants" }),
});

export const profileSchema = z.object({
  fullName: z.string().trim().min(2, { message: "Name must be at least 2 characters" }).max(200),
  phoneNumber: z.string().trim().regex(phoneRegex, { message: "Invalid phone number format" }).max(20),
  address: z.string().trim().min(5, { message: "Address must be at least 5 characters" }).max(500),
});
