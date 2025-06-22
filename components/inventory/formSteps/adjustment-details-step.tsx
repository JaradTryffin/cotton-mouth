"use client";

import { useInventoryStore } from "@/store/inventory-store";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

export function AdjustmentDetailsStep() {
  const { formData, updateField } = useInventoryStore();

  if (formData.type !== "ADJUSTMENT" && formData.type !== "WASTE") {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="reason">
            Reason for {formData.type === "WASTE" ? "Waste/Loss" : "Adjustment"}
          </Label>
          <Textarea
            id="reason"
            placeholder={
              formData.type === "WASTE"
                ? "e.g., Product expired, damaged during handling, theft, etc."
                : "e.g., Stock count discrepancy, found additional inventory, etc."
            }
            value={formData.reason || ""}
            onChange={(e) => updateField("reason", e.target.value)}
            rows={3}
          />
          <p className="text-sm text-muted-foreground">
            Required for audit trail and inventory management
          </p>
        </div>

        {formData.type === "ADJUSTMENT" && (
          <div className="space-y-2">
            <Label>Adjustment Type</Label>
            <p className="text-sm text-muted-foreground">
              Positive quantity = Add stock | Negative quantity = Remove stock
            </p>
          </div>
        )}
      </div>

      {/* Impact Summary */}
      {formData.quantity && (
        <Card
          className={`border-${formData.type === "WASTE" ? "red" : "blue"}-200 bg-${formData.type === "WASTE" ? "red" : "blue"}-50`}
        >
          <CardContent className="p-4">
            <h4
              className={`font-medium text-${formData.type === "WASTE" ? "red" : "blue"}-800 mb-2`}
            >
              Impact Summary
            </h4>
            <div
              className={`space-y-1 text-sm text-${formData.type === "WASTE" ? "red" : "blue"}-700`}
            >
              <div className="flex justify-between">
                <span>Stock Change:</span>
                <span>
                  {formData.type === "WASTE" ? "-" : ""}
                  {formData.quantity} units
                </span>
              </div>
              <div className="flex justify-between">
                <span>Type:</span>
                <span>
                  {formData.type === "WASTE"
                    ? "Loss/Waste"
                    : "Stock Adjustment"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
