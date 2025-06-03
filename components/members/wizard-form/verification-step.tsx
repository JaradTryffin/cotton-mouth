"use client";

import { useMembershipStore } from "@/store/membership-store";
import { Label } from "@/components/ui/label";
import { FileUploader } from "@/components/file-uploader";

export function VerificationStep() {
  const { formData, updateField } = useMembershipStore();

  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-4">
        <h3 className="mb-2 text-lg font-medium">ID Verification</h3>
        <p>
          Please upload clear images of the front and back of your
          government-issued ID. Acceptable formats include driver&#39;s license,
          passport, or state ID
        </p>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Front of ID</Label>
            <FileUploader
              value={formData.idFront || ""}
              onChange={(value) => updateField("idFront", value)}
              accept="image/*"
              maxSize={5}
              label="Upload front of ID"
            />
          </div>

          <div className="space-y-2">
            <Label>Back of ID</Label>
            <FileUploader
              value={formData.idBack || ""}
              onChange={(value) => updateField("idBack", value)}
              accept="image/*"
              maxSize={5}
              label="Upload back of ID"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
