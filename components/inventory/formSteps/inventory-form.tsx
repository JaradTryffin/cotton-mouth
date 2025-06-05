"use client";

import { useRouter } from "next/navigation";
import { useInventoryStore } from "@/store/inventory-store";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle, Package, Plus } from "lucide-react";
import { BasicInfoStep } from "@/components/inventory/formSteps/basic-info-step";
import { PurchaseDetailsStep } from "@/components/inventory/formSteps/purchase-detail-step";
import { AdjustmentDetailsStep } from "@/components/inventory/formSteps/adjustment-details-step";
import { ConfirmationStep } from "@/components/inventory/formSteps/confirmation-step";
import { WizardForm } from "@/components/wizard-form";

interface InventoryFormProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function InventoryForm({
  trigger,
  open,
  onOpenChange,
}: InventoryFormProps) {
  const router = useRouter();
  const {
    formData,
    setSubmitting,
    resetForm,
    validateBasicInfo,
    validatePurchase,
    validateAdjustment,
  } = useInventoryStore();

  const handleComplete = async () => {
    try {
      // Final validation based on type
      let validation;
      if (formData.type === "PURCHASE") {
        validation = validatePurchase();
      } else if (formData.type === "ADJUSTMENT" || formData.type === "WASTE") {
        validation = validateAdjustment();
      } else {
        validation = validateBasicInfo();
      }

      if (!validation.isValid) {
        toast.error("Please fix the validation errors before proceeding");
        return;
      }

      setSubmitting(true);

      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: formData.productId,
          type: formData.type,
          quantity: formData.quantity,
          costPrice: formData.costPrice,
          reason: formData.reason,
          batchNumber: formData.batchNumber,
          expiryDate: formData.expiryDate?.toISOString(),
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to update inventory");
      }

      // Success message based on type
      let successMessage = "";
      if (formData.type === "PURCHASE") {
        successMessage = `Successfully added ${formData.quantity} units to inventory. Total cost: R${(formData.quantity! * formData.costPrice!).toFixed(2)}`;
      } else if (formData.type === "WASTE") {
        successMessage = `Waste recorded: ${formData.quantity} units removed from inventory`;
      } else {
        successMessage = `Stock adjustment completed: ${formData.quantity} units`;
      }

      toast.success(successMessage);

      resetForm();
      if (onOpenChange) onOpenChange(false);

      // Refresh the page to update inventory data
      router.refresh();
    } catch (error) {
      console.error("Error updating inventory:", error);
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

  // Build wizard steps based on selected type
  const getWizardSteps = () => {
    const steps = [
      {
        id: "basic",
        title: "Basic Information",
        description: "Select product and movement type",
        icon: <Package className="w-4 h-4" />,
        content: <BasicInfoStep />,
        isValid: () => validateBasicInfo().isValid,
        getValidationErrors: () => validateBasicInfo().errors,
      },
    ];

    // Add type-specific steps
    if (formData.type === "PURCHASE") {
      steps.push({
        id: "purchase",
        title: "Purchase Details",
        description: "Cost and supplier information",
        icon: <Plus className="w-4 h-4" />,
        content: <PurchaseDetailsStep />,
        isValid: () => validatePurchase().isValid,
        getValidationErrors: () => validatePurchase().errors,
      });
    } else if (formData.type === "ADJUSTMENT" || formData.type === "WASTE") {
      steps.push({
        id: "adjustment",
        title:
          formData.type === "WASTE" ? "Waste Details" : "Adjustment Details",
        description: "Reason and documentation",
        icon: <AlertTriangle className="w-4 h-4" />,
        content: <AdjustmentDetailsStep />,
        isValid: () => validateAdjustment().isValid,
        getValidationErrors: () => validateAdjustment().errors,
      });
    }

    // Add confirmation step
    steps.push({
      id: "confirmation",
      title: "Confirm & Process",
      description: "Review and submit inventory change",
      icon: <CheckCircle className="w-4 h-4" />,
      content: <ConfirmationStep />,
      isValid: () => true,
      getValidationErrors: () => [],
    });

    return steps;
  };

  return (
    <WizardForm
      steps={getWizardSteps()}
      onComplete={handleComplete}
      onCancel={handleCancel}
      mode="create"
      trigger={trigger}
      open={open}
      onOpenChange={onOpenChange}
    />
  );
}
