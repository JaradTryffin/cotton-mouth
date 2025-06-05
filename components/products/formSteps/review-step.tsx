"use client";

import { useProductStore } from "@/store/product-store";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Info, Package, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function ReviewStep() {
  const { formData } = useProductStore();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Review Product Details</h3>
        <p className="text-sm text-muted-foreground">
          Please review the information below before creating the product
        </p>
      </div>

      {/* Basic Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Package className="h-5 w-5 text-muted-foreground" />
            <h4 className="font-medium">Basic Information</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Name:</span>
              <p className="font-medium">{formData.name}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Category:</span>
              <p className="font-medium">{formData.category}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Unit:</span>
              <p className="font-medium">{formData.unit}</p>
            </div>
            {formData.description && (
              <div className="md:col-span-2">
                <span className="text-muted-foreground">Description:</span>
                <p className="font-medium">{formData.description}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <DollarSign className="h-5 w-5 text-muted-foreground" />
            <h4 className="font-medium">Pricing</h4>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Token Price:</span>
              <span className="font-medium">
                {formData.tokenPrice} tokens/{formData.unit}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cost Price:</span>
              <span className="font-medium">
                R{formData.costPrice?.toFixed(2)}/{formData.unit}
              </span>
            </div>
            {formData.sellingPrice && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Selling Price:</span>
                <span className="font-medium">
                  R{formData.sellingPrice.toFixed(2)}/{formData.unit}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Settings className="h-5 w-5 text-muted-foreground" />
            <h4 className="font-medium">Settings</h4>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <Badge variant={formData.displayOnApp ? "default" : "secondary"}>
                {formData.displayOnApp ? "App Visible" : "App Hidden"}
              </Badge>
            </div>
            <div className="text-center">
              <Badge variant={formData.allowGifting ? "default" : "secondary"}>
                {formData.allowGifting ? "Gifting On" : "Gifting Off"}
              </Badge>
            </div>
            <div className="text-center">
              <Badge
                variant={formData.ignoreDiscounts ? "destructive" : "default"}
              >
                {formData.ignoreDiscounts ? "No Discounts" : "Discounts Apply"}
              </Badge>
            </div>
          </div>
          {formData.jarWeight && (
            <div className="mt-3 text-sm">
              <span className="text-muted-foreground">Jar Weight:</span>
              <span className="font-medium ml-2">{formData.jarWeight}g</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Initial Stock Notice */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Info className="h-5 w-5 text-amber-600" />
            <div>
              <h4 className="font-medium text-amber-800">Initial Stock</h4>
              <p className="text-sm text-amber-700 mt-1">
                This product will be created with 0 stock. Use the Inventory
                Management to add initial stock after creation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
