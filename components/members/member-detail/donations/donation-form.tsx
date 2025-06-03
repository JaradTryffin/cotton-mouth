"use client";

import { useRouter } from "next/navigation";
import { DollarSign, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useDonationStore } from "@/store/donation-store";

import { useEffect } from "react";
import { DonationDetailsStep } from "@/components/members/member-detail/donations/donation-details";
import { ConfirmationStep } from "@/components/members/member-detail/donations/confirmation-step";
import { WizardForm } from "@/components/wizard-form";

interface DonationFormProps {
  memberId: string; // Required since we're in member context
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function DonationForm({
  memberId,
  trigger,
  open,
  onOpenChange,
}: DonationFormProps) {
  const router = useRouter();
  const {
    formData,
    setSubmitting,
    resetForm,
    setMemberId,
    validateDonationDetails,
    validateConfirmation,
  } = useDonationStore();

  // Set member ID when component mounts or memberId changes
  useEffect(() => {
    if (memberId) {
      setMemberId(memberId);
    }
  }, [memberId, setMemberId]);

  const handleComplete = async () => {
    try {
      // Final validation
      const validation = validateConfirmation();
      if (!validation.isValid) {
        toast.error("Please fix the validation errors before proceeding");
        return;
      }

      setSubmitting(true);

      const response = await fetch("/api/donations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memberId: formData.memberId,
          amount: formData.amount,
          method: formData.method,
          notes: formData.notes,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to process donation");
      }

      toast.success(
        `Donation of R${formData.amount?.toFixed(2)} processed successfully! ${responseData.tokensIssued} tokens issued.`,
      );

      resetForm();
      if (onOpenChange) onOpenChange(false);

      // Refresh the page to update member balance
      router.refresh();
    } catch (error) {
      console.error("Error processing donation:", error);
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
      id: "details",
      title: "Donation Details",
      description: "Enter donation amount and payment method",
      icon: <DollarSign className="w-4 h-4" />,
      content: <DonationDetailsStep />,
      isValid: () => validateDonationDetails().isValid,
      getValidationErrors: () => validateDonationDetails().errors,
    },
    {
      id: "confirmation",
      title: "Confirm & Process",
      description: "Review details and process donation",
      icon: <CheckCircle className="w-4 h-4" />,
      content: <ConfirmationStep />,
      isValid: () => validateConfirmation().isValid,
      getValidationErrors: () => validateConfirmation().errors,
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
