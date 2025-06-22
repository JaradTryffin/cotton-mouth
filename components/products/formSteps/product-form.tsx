"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Package, DollarSign, Settings, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useProductStore } from "@/store/product-store";
import { WizardForm } from "@/components/wizard-form";
import { BasicInfoStep } from "@/components/products/formSteps/BasicInfoSteo";
import { PricingStep } from "@/components/products/formSteps/pricing-step";
import { SettingsStep } from "@/components/products/formSteps/setting-step";
import { ReviewStep } from "@/components/products/formSteps/review-step";

interface ProductFormProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  mode?: "create" | "edit";
  productId?: string;
}

export default function ProductForm({
  trigger,
  open,
  onOpenChange,
  mode = "create",
  productId,
}: ProductFormProps) {
  const router = useRouter();
  const {
    formData,
    setSubmitting,
    resetForm,
    validateBasicInfo,
    validatePricing,
    validateSettings,
    validateComplete,
  } = useProductStore();

  const handleComplete = async () => {
    try {
      // Final validation
      const validation = validateComplete();
      if (!validation.isValid) {
        toast.error("Please fix the validation errors before proceeding");
        return;
      }

      setSubmitting(true);

      const endpoint =
        mode === "edit" && productId
          ? `/api/products/${productId}`
          : "/api/products";

      const method = mode === "edit" ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          description: formData.description,
          tokenPrice: formData.tokenPrice,
          costPrice: formData.costPrice,
          sellingPrice: formData.sellingPrice,
          unit: formData.unit,
          jarWeight: formData.jarWeight,
          displayOnApp: formData.displayOnApp,
          allowGifting: formData.allowGifting,
          ignoreDiscounts: formData.ignoreDiscounts,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || `Failed to ${mode} product`);
      }

      const actionText = mode === "edit" ? "updated" : "created";
      toast.success(
        `Product "${formData.name}" has been ${actionText} successfully!`,
      );

      resetForm();
      router.refresh();
      if (onOpenChange) onOpenChange(false);

      // Navigate to products page or refresh
      if (mode === "create") {
        router.push("/dashboard/products");
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error(`Error ${mode}ing product:`, error);
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
      id: "basic",
      title: "Basic Information",
      description: "Name, category, and description",
      icon: <Package className="w-4 h-4" />,
      content: <BasicInfoStep />,
      isValid: () => validateBasicInfo().isValid,
      getValidationErrors: () => validateBasicInfo().errors,
    },
    {
      id: "pricing",
      title: "Pricing",
      description: "Token price and cost information",
      icon: <DollarSign className="w-4 h-4" />,
      content: <PricingStep />,
      isValid: () => validatePricing().isValid,
      getValidationErrors: () => validatePricing().errors,
    },
    {
      id: "settings",
      title: "Settings",
      description: "Display and behavior options",
      icon: <Settings className="w-4 h-4" />,
      content: <SettingsStep />,
      isValid: () => validateSettings().isValid,
      getValidationErrors: () => validateSettings().errors,
    },
    {
      id: "review",
      title: "Review & Create",
      description: "Confirm product details",
      icon: <CheckCircle className="w-4 h-4" />,
      content: <ReviewStep />,
      isValid: () => validateComplete().isValid,
      getValidationErrors: () => validateComplete().errors,
    },
  ];

  return (
    <WizardForm
      steps={wizardSteps}
      onComplete={handleComplete}
      onCancel={handleCancel}
      mode={mode}
      trigger={trigger}
      open={open}
      onOpenChange={onOpenChange}
    />
  );
}
