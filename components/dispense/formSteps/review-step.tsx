"use client";

import { useDispensingStore } from "@/store/dispensing-store";
import { Card, CardContent } from "@/components/ui/card";
import { Coins, Package, User } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

export function ReviewStep() {
  const { formData, cart, getCartTotal, updateField } = useDispensingStore();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Review Transaction</h3>
        <p className="text-sm text-muted-foreground">
          Please review the details below before processing
        </p>
      </div>

      {/* Member Summary */}
      {formData.member && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <h4 className="font-medium">Member</h4>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Name:</span>
                <p className="font-medium">
                  {formData.member.firstName} {formData.member.lastName}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Current Balance:</span>
                <p className="font-medium">
                  {formData.member.tokenBalance} tokens
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cart Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Package className="h-5 w-5 text-muted-foreground" />
            <h4 className="font-medium">Items ({cart.length})</h4>
          </div>
          <div className="space-y-2">
            {cart.map((item) => (
              <div
                key={item.productId}
                className="flex justify-between text-sm"
              >
                <span>{item.product.name}</span>
                <div className="text-right">
                  <div>
                    {item.quantity} × {item.product.tokenPrice}t ={" "}
                    {item.totalPrice}t
                  </div>
                </div>
              </div>
            ))}
            <div className="border-t pt-2 flex justify-between font-medium">
              <span>Total:</span>
              <span>{getCartTotal()} tokens</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Balance After Transaction */}
      {formData.member && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <Coins className="h-5 w-5 text-green-600" />
              <h4 className="font-medium text-green-800">
                Balance After Transaction
              </h4>
            </div>
            <div className="flex justify-between items-center text-green-700">
              <span>New Token Balance:</span>
              <span className="text-lg font-bold">
                {formData.member.tokenBalance - getCartTotal()} tokens
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Optional Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          placeholder="Add any notes about this transaction..."
          value={formData.notes || ""}
          onChange={(e) => updateField("notes", e.target.value)}
          rows={3}
        />
      </div>

      {/* Transaction Summary */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <h4 className="font-medium text-blue-800 mb-2">
            Transaction Summary
          </h4>
          <div className="space-y-1 text-sm text-blue-700">
            <div className="flex justify-between">
              <span>Items:</span>
              <span>{cart.length} products</span>
            </div>
            <div className="flex justify-between">
              <span>Total Tokens:</span>
              <span>{getCartTotal()} tokens</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span>{format(new Date(), "PPP")}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
