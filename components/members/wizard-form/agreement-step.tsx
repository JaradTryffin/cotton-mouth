"use client";

import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { UserAgreement } from "@/components/user-agreement";
import { useMembershipStore } from "@/store/membership-store";
import { SignaturePad } from "@/components/signature-pad";

export function AgreementStep() {
  const { formData, updateField, isSubmitting } = useMembershipStore();

  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-4">
        <h3 className="mb-2 text-lg font-medium">Membership Agreement</h3>
        <UserAgreement />

        <div className="mt-4 flex items-start space-x-3">
          <Checkbox
            id="termsAgreed"
            checked={formData.termsAgreed || false}
            onCheckedChange={(checked) => updateField("termsAgreed", !!checked)}
          />
          <Label htmlFor="termsAgreed" className="text-sm leading-none">
            I have read and agree to the membership terms and conditions
          </Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Signature</Label>
        <SignaturePad
          value={formData.signature || ""}
          onChange={(value) => updateField("signature", value)}
        />
        <p className="text-sm text-muted-foreground">
          Please sign using your finger or mouse
        </p>
      </div>

      <div className="rounded-lg border bg-muted/50 p-4">
        <p className="text-sm text-muted-foreground">
          Registration Date: {format(new Date(), "PPP")}
        </p>
      </div>

      {isSubmitting && (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          <span>Submitting registration...</span>
        </div>
      )}
    </div>
  );
}
