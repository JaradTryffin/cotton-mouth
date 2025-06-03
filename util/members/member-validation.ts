import { z } from "zod";

export const membershipFormSchema = z.object({
  firstName: z
    .string()
    .min(2, { message: "First name must be at least 2 characters" }),
  lastName: z
    .string()
    .min(2, { message: "Last name must be at least 2 characters" }),
  dateOfBirth: z
    .date({
      required_error: "Date of birth is required",
    })
    .refine(
      (date) => {
        const today = new Date();
        const age = today.getFullYear() - date.getFullYear();
        const m = today.getMonth() - date.getMonth();
        return m < 0 || (m === 0 && today.getDate() < date.getDate())
          ? age - 1 >= 21
          : age >= 21;
      },
      { message: "You must be at least 21 years old" },
    ),
  email: z
    .string()
    .email({ message: "Please enter a valid email address" })
    .optional(),
  phoneNumber: z
    .string()
    .min(10, { message: "Please enter a valid phone number" }),
  address: z.string().min(5, { message: "Address is required" }),
  city: z.string().min(2, { message: "City is required" }),
  state: z.string().min(2, { message: "State is required" }),
  zipCode: z.string().min(5, { message: "ZIP code is required" }),
  membershipType: z.string({
    required_error: "Please select a membership type",
  }),
  idFront: z.string().min(1, { message: "Front of ID is required" }),
  idBack: z.string().min(1, { message: "Back of ID is required" }),
  termsAgreed: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
  signature: z.string().min(1, { message: "Signature is required" }),
  referrerId: z.string().optional(),
});

export type MembershipFormData = z.infer<typeof membershipFormSchema>;
