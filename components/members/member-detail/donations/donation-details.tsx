"use client";

import { useDonationStore } from "@/store/donation-store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

export function DonationDetailsStep() {
  const { formData, updateField } = useDonationStore();

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    updateField("amount", value);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Donation Amount (R)</Label>
          <div className="relative">
            R
            <Input
              id="amount"
              type="number"
              min="0"
              max="10000"
              step="0.01"
              placeholder="0.00"
              value={formData.amount || ""}
              onChange={handleAmountChange}
              className="pl-10"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Enter the amount in South African Rands (Maximum: R10,000)
          </p>
        </div>

        <div className="space-y-2">
          <Label>Payment Method</Label>
          <Select
            value={formData.method || "cash"}
            onValueChange={(value) => updateField("method", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="card">Card Payment</SelectItem>
              <SelectItem value="eft">EFT/Bank Transfer</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea
            id="notes"
            placeholder="Add any additional notes about this donation..."
            value={formData.notes || ""}
            onChange={(e) => updateField("notes", e.target.value)}
            rows={3}
          />
        </div>
      </div>

      {/* Token Conversion Display */}
      {formData.amount && formData.amount > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                R
              </div>
              <div>
                <h3 className="font-semibold text-green-800">
                  Token Conversion
                </h3>
                <p className="text-sm text-green-700">
                  R{formData.amount.toFixed(2)} = {formData.amount.toFixed(0)}{" "}
                  tokens
                </p>
                <p className="text-xs text-green-600">
                  Exchange rate: R1 = 1 token
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
