"use client";
import { useInventoryStore } from "@/store/inventory-store";

export function ConfirmationStep() {
  const { formData } = useInventoryStore();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Confirm Inventory Update</h3>
        <p className="text-sm text-muted-foreground">
          Please review the information below before processing
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Movement Type:</span>
          <span className="font-medium">{formData.type}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">Quantity:</span>
          <span className="font-medium">{formData.quantity} units</span>
        </div>

        {formData.costPrice && (
          <>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cost per Unit:</span>
              <span className="font-medium">
                R{formData.costPrice.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Cost:</span>
              <span className="font-medium text-green-600">
                R{(formData.quantity! * formData.costPrice).toFixed(2)}
              </span>
            </div>
          </>
        )}

        {formData.reason && (
          <div>
            <span className="text-muted-foreground">Reason:</span>
            <p className="font-medium mt-1">{formData.reason}</p>
          </div>
        )}

        {formData.batchNumber && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Batch Number:</span>
            <span className="font-medium">{formData.batchNumber}</span>
          </div>
        )}
      </div>
    </div>
  );
}
