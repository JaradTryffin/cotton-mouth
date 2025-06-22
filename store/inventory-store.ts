import { create } from "zustand/react";

interface InventoryFormData {
  productId: string;
  type: "PURCHASE" | "ADJUSTMENT" | "WASTE";
  quantity: number;
  costPrice?: number;
  reason?: string;
  batchNumber?: string;
  expiryDate?: Date;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

interface InventoryStore {
  formData: Partial<InventoryFormData>;
  isSubmitting: boolean;

  //Actions
  updateField: (field: keyof InventoryFormData, value: any) => void;
  setSubmitting: (submitting: boolean) => void;
  resetForm: () => void;

  //Validation
  validateBasicInfo: () => ValidationResult;
  validatePurchase: () => ValidationResult;
  validateAdjustment: () => ValidationResult;
}

export const useInventoryStore = create<InventoryStore>((set, get) => ({
  formData: {},
  isSubmitting: false,

  updateField: (field, value) =>
    set((state) => ({
      formData: { ...state.formData, [field]: value },
    })),

  setSubmitting: (submitting) => set({ isSubmitting: submitting }),

  resetForm: () => set({ formData: {}, isSubmitting: false }),

  validateBasicInfo: () => {
    const { formData } = get();
    const errors: string[] = [];

    if (!formData.productId) {
      errors.push("Please select a product");
    }

    if (!formData.type) {
      errors.push("Please select a movement type");
    }

    if (!formData.quantity || formData.quantity <= 0) {
      errors.push("Please enter a valid quantity");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  validatePurchase: () => {
    const basicValidation = get().validateBasicInfo();
    const { formData } = get();
    const errors = [...basicValidation.errors];

    if (formData.type === "PURCHASE") {
      if (!formData.costPrice || formData.costPrice <= 0) {
        errors.push("Cost price is required for purchases");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  validateAdjustment: () => {
    const basicValidation = get().validateBasicInfo();
    const { formData } = get();
    const errors = [...basicValidation.errors];

    if (formData.type === "ADJUSTMENT" || formData.type === "WASTE") {
      if (!formData.reason?.trim()) {
        errors.push("Please provide a reason for this adjustment");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },
}));
