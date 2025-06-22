import type { Metadata } from "next";
import { ShoppingCart, TrendingUp, DollarSign, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DispensingForm from "@/components/dispense/formSteps/dispensing-form";

export const metadata: Metadata = {
  title: "Dispensing | Cotton Mouth",
  description: "Dispense products to members using token balances",
};

export default function DispensingPage() {
  return (
    <div className="p-5 container mx-auto py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dispensing</h1>
          <p className="text-muted-foreground">
            Dispense products to members using their token balances
          </p>
        </div>
        <DispensingForm
          trigger={
            <Button className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              New Transaction
            </Button>
          }
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today's Transactions
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Dispensing transactions today
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tokens Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Total tokens spent today
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Items Dispensed
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Products dispensed today
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Transaction
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Tokens per transaction
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
              Quick Dispense
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Start a new dispensing transaction for a member
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-green-600" />
              Check Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              View current inventory levels and availability
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Today&#39;s Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              View detailed breakdown of today&#39;s dispensing activity
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions Table Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No transactions yet. Start dispensing to see transaction history!
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="mt-6 border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <h3 className="font-medium text-blue-800 mb-2">
            How Dispensing Works
          </h3>
          <div className="space-y-2 text-sm text-blue-700">
            <p>
              1. <strong>Select Member:</strong> Search and choose an active
              member with sufficient token balance
            </p>
            <p>
              2. <strong>Add Products:</strong> Browse available products and
              add them to the cart
            </p>
            <p>
              3. <strong>Review & Confirm:</strong> Check the transaction
              details and process the dispensing
            </p>
            <p>
              4. <strong>Automatic Updates:</strong> Stock levels decrease and
              member token balance is updated automatically
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
