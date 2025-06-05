import { create } from "zustand/react";

interface ProductFormData {
  name: string;
  category: string;
  description?: string;
  tokenPrice: number;
  costPrice: number;
  sellingPrice?: number;
  unit: string;
  jarWeight?: number;
  displayOnApp: boolean;
  allowGifting: boolean;
  ignoreDiscounts: boolean;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

interface ProductStore {
  formData: Partial<ProductFormData>;
  isSubmitting: boolean;

  //Actions
  updateField: (field: keyof ProductFormData, value: any) => void;
  setSubmitting: (submitting: boolean) => void;
  resetForm: () => void;

  //Validation
  validateBasicInfo: () => ValidationResult;
  validatePricing: () => ValidationResult;
  validateSettings: () => ValidationResult;
  validateComplete: () => ValidationResult;
}

export const PRODUCT_CATEGORIES = [
  "Premium",
  "Premium Special",
  "Exotic Indoor",
  "Tunnel",
  "Gummies",
  "Cannagars",
  "Vapes",
  "Papers",
  "Backwoods",
  "Concentrates",
  "Accessories",
  "Other",
];

// Common units
export const PRODUCT_UNITS = [
  "gram",
  "ounce",
  "pound",
  "piece",
  "pack",
  "tub",
  "packet",
  "cartridge",
  "bottle",
  "jar",
];

export const useProductStore = create<ProductStore>((set, get) => ({
  formData: {
    displayOnApp: true,
    allowGifting: false,
    ignoreDiscounts: false,
  },
  isSubmitting: false,

  updateField: (field, value) =>
    set((state) => ({
      formData: { ...state.formData, [field]: value },
    })),

  setSubmitting: (submitting) => set({ isSubmitting: submitting }),

  resetForm: () =>
    set({
      formData: {
        displayOnApp: true,
        allowGifting: false,
        ignoreDiscounts: false,
      },
      isSubmitting: false,
    }),

  validateBasicInfo: () => {
    const { formData } = get();
    const errors: string[] = [];

    if (!formData.name?.trim()) {
      errors.push("Product name is required");
    }

    if (!formData.category?.trim()) {
      errors.push("Category is required");
    }

    if (!formData.unit?.trim()) {
      errors.push("Unit of measurement is requirement");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  validatePricing: () => {
    const { formData } = get();
    const errors: string[] = [];

    if (!formData.tokenPrice || formData.tokenPrice <= 0) {
      errors.push("Token price must be greater than 0");
    }

    if (!formData.costPrice || formData.costPrice <= 0) {
      errors.push("Cost price must be greater than 0");
    }

    // Warning if token price is less than cost price (potential loss)
    if (
      formData.tokenPrice &&
      formData.costPrice &&
      formData.tokenPrice < formData.costPrice
    ) {
      errors.push(
        "Warning: Token price is less than cost price - this may result in losses",
      );
    }

    // If selling price is provided, validate it
    if (formData.sellingPrice && formData.sellingPrice <= 0) {
      errors.push("Selling price must be greater than 0 if provided");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  validateSettings: () => {
    const { formData } = get();
    const errors: string[] = [];

    // Jar weight validation
    if (formData.jarWeight && formData.jarWeight < 0) {
      errors.push("Jar weight cannot be negative");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  validateComplete: () => {
    const basicValidation = get().validateBasicInfo();
    const pricingValidation = get().validatePricing();
    const settingsValidation = get().validateSettings();

    const errors = [
      ...basicValidation.errors,
      ...pricingValidation.errors,
      ...settingsValidation.errors,
    ];

    return {
      isValid: errors.length === 0,
      errors,
    };
  },
}));
