"use client";

import { useRouter } from "next/navigation";
import { User, ShoppingCart, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useDispensingStore } from "@/store/dispensing-store";
import { WizardForm } from "@/components/wizard-form";
import { useEffect } from "react";
import { MemberSelectionStep } from "@/components/dispense/formSteps/member-selection-step";
import { ProductSelectionStep } from "@/components/dispense/formSteps/product-selection-step";
import { ReviewStep } from "@/components/dispense/formSteps/review-step";

interface DispensingFormProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  memberId?: string; // Optional pre-selected member
}

export default function DispensingForm({
  trigger,
  open,
  onOpenChange,
  memberId,
}: DispensingFormProps) {
  const router = useRouter();
  const {
    formData,
    cart,
    setSubmitting,
    resetForm,
    validateMember,
    validateCart,
    validateTransaction,
    setMember,
  } = useDispensingStore();

  // Pre-select member if memberId is provided
  useEffect(() => {
    if (memberId && !formData.member) {
      const fetchMember = async () => {
        try {
          const response = await fetch(`/api/members/${memberId}`);
          if (response.ok) {
            const memberData = await response.json();
            setMember({
              id: memberData.id,
              firstName: memberData.firstName,
              lastName: memberData.lastName,
              tokenBalance: memberData.tokenBalance,
              isActive: memberData.isActive,
              email: memberData.email,
            });
          }
        } catch (error) {
          console.error("Error fetching member:", error);
        }
      };

      fetchMember();
    }
  }, [memberId, formData.member, setMember]);

  const handleComplete = async () => {
    try {
      // Final validation
      const validation = validateTransaction();
      if (!validation.isValid) {
        toast.error("Please fix the validation errors before proceeding");
        return;
      }

      setSubmitting(true);

      // Prepare the dispensing request
      const dispensingData = {
        memberId: formData.memberId!,
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        notes: formData.notes,
      };

      const response = await fetch("/api/dispensing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dispensingData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to process dispensing");
      }

      toast.success(
        `Transaction completed! ${cart.length} items dispensed. ${responseData.tokensSpent} tokens spent.`,
      );

      resetForm();
      if (onOpenChange) onOpenChange(false);

      // Refresh the page to update data
      router.refresh();
    } catch (error) {
      console.error("Error processing dispensing:", error);
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    if (onOpenChange) onOpenChange(false);
  };

  const wizardSteps = [
    {
      id: "member",
      title: "Select Member",
      description: "Choose member for dispensing",
      icon: <User className="w-4 h-4" />,
      content: <MemberSelectionStep />,
      isValid: () => validateMember().isValid,
      getValidationErrors: () => validateMember().errors,
    },
    {
      id: "products",
      title: "Select Products",
      description: "Add items to cart",
      icon: <ShoppingCart className="w-4 h-4" />,
      content: <ProductSelectionStep />,
      isValid: () => validateCart().isValid,
      getValidationErrors: () => validateCart().errors,
    },
    {
      id: "review",
      title: "Review & Dispense",
      description: "Confirm and complete transaction",
      icon: <CheckCircle className="w-4 h-4" />,
      content: <ReviewStep />,
      isValid: () => validateTransaction().isValid,
      getValidationErrors: () => validateTransaction().errors,
    },
  ];

  return (
    <WizardForm
      steps={wizardSteps}
      onComplete={handleComplete}
      onCancel={handleCancel}
      mode="create"
      trigger={trigger}
      open={open}
      onOpenChange={onOpenChange}
    />
  );
}
