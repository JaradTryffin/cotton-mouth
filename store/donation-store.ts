import { create } from "zustand";

interface DonationFormData {
  memberId: string;
  amount: number;
  method: string;
  notes?: string;
}

interface DonationStore {
  formData: Partial<DonationFormData>;
  isSubmitting: boolean;

  // Actions
  updateField: (field: keyof DonationFormData, value: any) => void;
  setSubmitting: (submitting: boolean) => void;
  resetForm: () => void;
  setMemberId: (memberId: string) => void;

  // Validation
  validateDonationDetails: () => { isValid: boolean; errors: string[] };
  validateConfirmation: () => { isValid: boolean; errors: string[] };
}

const initialFormData: Partial<DonationFormData> = {
  memberId: "",
  amount: 0,
  method: "cash",
  notes: "",
};

export const useDonationStore = create<DonationStore>((set, get) => ({
  formData: initialFormData,
  isSubmitting: false,

  updateField: (field, value) =>
      set((state) => ({
        formData: { ...state.formData, [field]: value },
      })),

  setSubmitting: (submitting) => set({ isSubmitting: submitting }),

  setMemberId: (memberId) =>
      set((state) => ({
        formData: { ...state.formData, memberId },
      })),

  resetForm: () =>
      set({
        formData: initialFormData,
        isSubmitting: false,
      }),

  validateDonationDetails: () => {
    const { formData } = get();
    const errors: string[] = [];

    if (!formData.amount || formData.amount <= 0) {
      errors.push("Donation amount must be greater than R0");
    }

    if (formData.amount && formData.amount > 10000) {
      errors.push("Donation amount cannot exceed R10,000");
    }

    if (!formData.method || formData.method.trim() === "") {
      errors.push("Please select a payment method");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  validateConfirmation: () => {
    const detailsValidation = get().validateDonationDetails();
    const { formData } = get();
    const errors = [...detailsValidation.errors];

    if (!formData.memberId) {
      errors.push("Member ID is required");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },
}));