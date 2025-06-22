import { create } from "zustand";

interface Product {
  id: string;
  name: string;
  category: string;
  tokenPrice: number;
  stock: number;
  unit: string;
  description?: string;
}

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  tokenBalance: number;
  isActive: boolean;
  email?: string;
}

interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  totalPrice: number;
}

interface DispensingFormData {
  memberId?: string;
  member?: Member;
  notes?: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

interface DispensingStore {
  formData: DispensingFormData;
  cart: CartItem[];
  isSubmitting: boolean;

  // Actions
  setMember: (member: Member | undefined) => void;
  updateField: (field: keyof DispensingFormData, value: any) => void;
  addToCart: (product: Product, quantity: number) => void;
  updateCartItem: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  setSubmitting: (submitting: boolean) => void;
  resetForm: () => void;

  // Computed values
  getCartTotal: () => number;
  getCartItemCount: () => number;

  // Validation
  validateMember: () => ValidationResult;
  validateCart: () => ValidationResult;
  validateTransaction: () => ValidationResult;
}

export const useDispensingStore = create<DispensingStore>((set, get) => ({
  formData: {},
  cart: [],
  isSubmitting: false,

  setMember: (member) =>
    set((state) => ({
      formData: {
        ...state.formData,
        memberId: member?.id,
        member,
      },
    })),

  updateField: (field, value) =>
    set((state) => ({
      formData: { ...state.formData, [field]: value },
    })),

  addToCart: (product, quantity) =>
    set((state) => {
      const existingItem = state.cart.find(
        (item) => item.productId === product.id,
      );

      if (existingItem) {
        // Update existing item
        return {
          cart: state.cart.map((item) =>
            item.productId === product.id
              ? {
                  ...item,
                  quantity: item.quantity + quantity,
                  totalPrice: (item.quantity + quantity) * product.tokenPrice,
                }
              : item,
          ),
        };
      } else {
        // Add new item
        return {
          cart: [
            ...state.cart,
            {
              productId: product.id,
              product,
              quantity,
              totalPrice: quantity * product.tokenPrice,
            },
          ],
        };
      }
    }),

  updateCartItem: (productId, quantity) =>
    set((state) => ({
      cart: state.cart.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity,
              totalPrice: quantity * item.product.tokenPrice,
            }
          : item,
      ),
    })),

  removeFromCart: (productId) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.productId !== productId),
    })),

  clearCart: () => set({ cart: [] }),

  setSubmitting: (submitting) => set({ isSubmitting: submitting }),

  resetForm: () =>
    set({
      formData: {},
      cart: [],
      isSubmitting: false,
    }),

  getCartTotal: () => {
    const { cart } = get();
    return cart.reduce((total, item) => total + item.totalPrice, 0);
  },

  getCartItemCount: () => {
    const { cart } = get();
    return cart.reduce((total, item) => total + item.quantity, 0);
  },

  validateMember: () => {
    const { formData } = get();
    const errors: string[] = [];

    if (!formData.member) {
      errors.push("Please select a member");
    } else {
      if (!formData.member.isActive) {
        errors.push("Selected member account is inactive");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  validateCart: () => {
    const { cart } = get();
    const errors: string[] = [];

    if (cart.length === 0) {
      errors.push("Please add items to the cart");
    }

    // Check stock availability
    for (const item of cart) {
      if (item.quantity > item.product.stock) {
        errors.push(
          `Insufficient stock for ${item.product.name}. Available: ${item.product.stock}, Requested: ${item.quantity}`,
        );
      }

      if (item.quantity <= 0) {
        errors.push(`Invalid quantity for ${item.product.name}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  validateTransaction: () => {
    const memberValidation = get().validateMember();
    const cartValidation = get().validateCart();
    const { formData } = get();
    const cartTotal = get().getCartTotal();

    const errors = [...memberValidation.errors, ...cartValidation.errors];

    // Check token balance
    if (formData.member && cartTotal > formData.member.tokenBalance) {
      errors.push(
        `Insufficient token balance. Required: ${cartTotal}, Available: ${formData.member.tokenBalance}`,
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },
}));
