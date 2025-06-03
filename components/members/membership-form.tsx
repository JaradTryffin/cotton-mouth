"use client";

import { useRouter } from "next/navigation";
import { User, MapPin, Shield, FileText } from "lucide-react";
import { toast } from "sonner";
import { WizardForm } from "../wizard-form";
import { useMembershipStore } from "@/store/membership-store";
import { membershipFormSchema } from "@/util/members/member-validation";
import { PersonalInfoStep } from "@/components/members/wizard-form/personal-info-step";
import { AddressStep } from "@/components/members/wizard-form/address-step";
import { VerificationStep } from "@/components/members/wizard-form/verification-step";
import { AgreementStep } from "@/components/members/wizard-form/agreement-step";

interface MembershipFormProps {
  referrerId?: string;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function MembershipForm({
  referrerId,
  trigger,
  open,
  onOpenChange,
}: MembershipFormProps) {
  const router = useRouter();
  const {
    formData,
    updateField,
    setSubmitting,
    resetForm,
    validatePersonalInfo,
    validateAddress,
    validateVerification,
    validateAgreement,
  } = useMembershipStore();

  // Set referrer ID if provided
  if (referrerId && !formData.referrerId) {
    updateField("referrerId", referrerId);
  }

  const handleComplete = async () => {
    try {
      // Final validation
      const validatedData = membershipFormSchema.parse(formData);

      setSubmitting(true);

      const response = await fetch("/api/members", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validatedData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to create member");
      }

      toast.success(
        `${validatedData.firstName} ${validatedData.lastName} has been registered successfully`,
      );

      resetForm();
      router.push("/dashboard/members/registration-success");
    } catch (error) {
      console.error("Error submitting form:", error);
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
      id: "personal",
      title: "Personal Information",
      description: "Basic details about you",
      icon: <User className="w-4 h-4" />,
      content: <PersonalInfoStep />,
      isValid: () => validatePersonalInfo().isValid,
      getValidationErrors: () => validatePersonalInfo().errors,
    },
    {
      id: "address",
      title: "Address & Membership",
      description: "Where you live and membership type",
      icon: <MapPin className="w-4 h-4" />,
      content: <AddressStep />,
      isValid: () => validateAddress().isValid,
      getValidationErrors: () => validateAddress().errors,
    },
    {
      id: "verification",
      title: "ID Verification",
      description: "Upload your government ID",
      icon: <Shield className="w-4 h-4" />,
      content: <VerificationStep />,
      isValid: () => validateVerification().isValid,
      getValidationErrors: () => validateVerification().errors,
    },
    {
      id: "agreement",
      title: "Agreement & Signature",
      description: "Terms and digital signature",
      icon: <FileText className="w-4 h-4" />,
      content: <AgreementStep />,
      isValid: () => validateAgreement().isValid,
      getValidationErrors: () => validateAgreement().errors,
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
