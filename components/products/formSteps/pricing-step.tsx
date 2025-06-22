"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useProductStore } from "@/store/product-store";

export function PricingStep() {
  const { formData, updateField } = useProductStore();

  const calculateMargin = () => {
    if (formData.tokenPrice && formData.costPrice) {
      const margin =
        ((formData.tokenPrice - formData.costPrice) / formData.tokenPrice) *
        100;
      return margin.toFixed(1);
    }
    return null;
  };

  const margin = calculateMargin();

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="tokenPrice">Token Price *</Label>
          <div className="relative">
            <Input
              id="tokenPrice"
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              value={formData.tokenPrice || ""}
              onChange={(e) =>
                updateField("tokenPrice", parseFloat(e.target.value) || 0)
              }
              className="pr-16"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              tokens
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            How many tokens members pay for one {formData.unit || "unit"}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="costPrice">Cost Price *</Label>
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
            What you pay suppliers for one {formData.unit || "unit"} (in Rands)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sellingPrice">Selling Price (Optional)</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              R
            </span>
            <Input
              id="sellingPrice"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={formData.sellingPrice || ""}
              onChange={(e) =>
                updateField("sellingPrice", parseFloat(e.target.value) || 0)
              }
              className="pl-8"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Internal Rand value for accounting purposes (optional)
          </p>
        </div>
      </div>

      {/* Pricing Analysis */}
      {formData.tokenPrice && formData.costPrice && (
        <Card
          className={`${
            formData.tokenPrice < formData.costPrice
              ? "border-red-200 bg-red-50"
              : "border-green-200 bg-green-50"
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <DollarSign
                className={`h-5 w-5 ${
                  formData.tokenPrice < formData.costPrice
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              />
              <h4
                className={`font-medium ${
                  formData.tokenPrice < formData.costPrice
                    ? "text-red-800"
                    : "text-green-800"
                }`}
              >
                Pricing Analysis
              </h4>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Token Price:</span>
                <span className="font-medium">
                  {formData.tokenPrice} tokens
                </span>
              </div>
              <div className="flex justify-between">
                <span>Cost Price:</span>
                <span className="font-medium">
                  R{formData.costPrice.toFixed(2)}
                </span>
              </div>
              {margin && (
                <div className="flex justify-between border-t pt-2">
                  <span>Profit Margin:</span>
                  <Badge
                    variant={parseFloat(margin) > 0 ? "default" : "destructive"}
                  >
                    {margin}%
                  </Badge>
                </div>
              )}
              {formData.tokenPrice < formData.costPrice && (
                <div className="text-red-700 text-xs mt-2 p-2 bg-red-100 rounded">
                  ⚠️ Warning: Token price is lower than cost price. This will
                  result in losses.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
