import { z } from 'zod';

export const addressSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().regex(/^[0-9]{10}$/, "Invalid phone number"),
  addressLine1: z.string().min(5, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^[0-9]{6}$/, "Invalid pincode"),
});

export const checkoutSchema = z.object({
  address: addressSchema,
  paymentMethod: z.enum(['ONLINE', 'COD']),
  couponCode: z.string().optional(),
});
