"use client";

import { useInventoryStore } from "@/store/inventory-store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";

export function PurchaseDetailsStep() {
  const { formData, updateField } = useInventoryStore();

  if (formData.type !== "PURCHASE") {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="costPrice">Cost Price per Unit (Rands)</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              R
            </span>
            <Input
              id="costPrice"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={formData.costPrice || ""}
              onChange={(e) =>
                updateField("costPrice", parseFloat(e.target.value) || 0)
              }
              className="pl-8"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            What you paid per unit for this product
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="batchNumber">Batch Number (Optional)</Label>
          <Input
            id="batchNumber"
            placeholder="e.g., BATCH001"
            value={formData.batchNumber || ""}
            onChange={(e) => updateField("batchNumber", e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            For tracking and quality control
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
          <Input
            id="expiryDate"
            type="date"
            value={
              formData.expiryDate
                ? format(formData.expiryDate, "yyyy-MM-dd")
                : ""
            }
            onChange={(e) =>
              updateField(
                "expiryDate",
                e.target.value ? new Date(e.target.value) : undefined,
              )
            }
          />
        </div>
      </div>

      {/* Purchase Summary */}
      {formData.quantity && formData.costPrice && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <h4 className="font-medium text-green-800 mb-2">
              Purchase Summary
            </h4>
            <div className="space-y-1 text-sm text-green-700">
              <div className="flex justify-between">
                <span>Quantity:</span>
                <span>{formData.quantity} units</span>
              </div>
              <div className="flex justify-between">
                <span>Cost per unit:</span>
                <span>R{formData.costPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium border-t pt-1">
                <span>Total Cost:</span>
                <span>
                  R{(formData.quantity * formData.costPrice).toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
