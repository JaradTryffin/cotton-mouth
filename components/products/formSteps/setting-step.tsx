"use client";

import { useProductStore } from "@/store/product-store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function SettingsStep() {
  const { formData, updateField } = useProductStore();

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="jarWeight">Jar Weight (Optional)</Label>
          <div className="relative">
            <Input
              id="jarWeight"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={formData.jarWeight || ""}
              onChange={(e) =>
                updateField(
                  "jarWeight",
                  parseFloat(e.target.value) || undefined,
                )
              }
              className="pr-12"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              g
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Weight of empty jar (for accurate stock measurements)
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Display on App</Label>
              <p className="text-sm text-muted-foreground">
                Show this product in the mobile app gallery
              </p>
            </div>
            <Switch
              checked={formData.displayOnApp ?? true}
              onCheckedChange={(checked) =>
                updateField("displayOnApp", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Allow Gifting</Label>
              <p className="text-sm text-muted-foreground">
                Members can gift this product to other members
              </p>
            </div>
            <Switch
              checked={formData.allowGifting ?? false}
              onCheckedChange={(checked) =>
                updateField("allowGifting", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Ignore Discounts</Label>
              <p className="text-sm text-muted-foreground">
                Exclude this product from membership discounts
              </p>
            </div>
            <Switch
              checked={formData.ignoreDiscounts ?? false}
              onCheckedChange={(checked) =>
                updateField("ignoreDiscounts", checked)
              }
            />
          </div>
        </div>
      </div>

      {/* Settings Summary */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Settings className="h-5 w-5 text-blue-600" />
            <h4 className="font-medium text-blue-800">
              Product Settings Summary
            </h4>
          </div>
          <div className="space-y-1 text-sm text-blue-700">
            <div className="flex justify-between">
              <span>App Visibility:</span>
              <Badge variant={formData.displayOnApp ? "default" : "secondary"}>
                {formData.displayOnApp ? "Visible" : "Hidden"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Gifting:</span>
              <Badge variant={formData.allowGifting ? "default" : "secondary"}>
                {formData.allowGifting ? "Allowed" : "Disabled"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Discounts:</span>
              <Badge
                variant={formData.ignoreDiscounts ? "destructive" : "default"}
              >
                {formData.ignoreDiscounts ? "Excluded" : "Included"}
              </Badge>
            </div>
            {formData.jarWeight && (
              <div className="flex justify-between">
                <span>Jar Weight:</span>
                <span>{formData.jarWeight}g</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
