import {
  MembershipFormData,
  membershipFormSchema,
} from "@/util/members/member-validation";
import { create } from "zustand/react";
import { z } from "zod";

interface MembershipStore {
  formData: Partial<MembershipFormData>;
  isSubmitting: boolean;

  //Actions
  updateField: <K extends keyof MembershipFormData>(
    field: K,
    value: MembershipFormData[K],
  ) => void;
  updateMultipleFields: (fields: Partial<MembershipFormData>) => void;
  setSubmitting: (submitting: boolean) => void;
  resetForm: () => void;

  //Validate Helpers
  validatePersonalInfo: () => { isValid: boolean; errors: string[] };
  validateAddress: () => { isValid: boolean; errors: string[] };
  validateVerification: () => { isValid: boolean; errors: string[] };
  validateAgreement: () => { isValid: boolean; errors: string[] };
}

const initialFormData: Partial<MembershipFormData> = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  membershipType: "standard",
  idFront: "",
  idBack: "",
  termsAgreed: false,
  signature: "",
  referrerId: "",
};

export const useMembershipStore = create<MembershipStore>((set, get) => ({
  formData: initialFormData,
  isSubmitting: false,

  updateField: (field, value) =>
    set((state) => ({
      formData: { ...state.formData, [field]: value },
    })),

  updateMultipleFields: (fields) =>
    set((state) => ({
      formData: { ...state.formData, ...fields },
    })),

  setSubmitting: (submitting) => set({ isSubmitting: submitting }),

  resetForm: () => set({ formData: initialFormData, isSubmitting: false }),

  // Validation methods
  validatePersonalInfo: () => {
    const { formData } = get();
    const personalSchema = membershipFormSchema.pick({
      firstName: true,
      lastName: true,
      dateOfBirth: true,
      phoneNumber: true,
    });

    try {
      personalSchema.parse(formData);
      return { isValid: true, errors: [] };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          errors: error.errors.map((e) => e.message),
        };
      }
      return { isValid: false, errors: ["Validation failed"] };
    }
  },

  validateAddress: () => {
    const { formData } = get();
    const addressSchema = membershipFormSchema.pick({
      address: true,
      city: true,
      state: true,
      zipCode: true,
      membershipType: true,
    });

    try {
      addressSchema.parse(formData);
      return { isValid: true, errors: [] };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          errors: error.errors.map((e) => e.message),
        };
      }
      return { isValid: false, errors: ["Validation failed"] };
    }
  },

  validateVerification: () => {
    const { formData } = get();
    const verificationSchema = membershipFormSchema.pick({
      idFront: true,
      idBack: true,
    });

    try {
      verificationSchema.parse(formData);
      return { isValid: true, errors: [] };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          errors: error.errors.map((e) => e.message),
        };
      }
      return { isValid: false, errors: ["Validation failed"] };
    }
  },

  validateAgreement: () => {
    const { formData } = get();
    const agreementSchema = membershipFormSchema.pick({
      termsAgreed: true,
      signature: true,
    });

    try {
      agreementSchema.parse(formData);
      return { isValid: true, errors: [] };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          errors: error.errors.map((e) => e.message),
        };
      }
      return { isValid: false, errors: ["Validation failed"] };
    }
  },
}));
