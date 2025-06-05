"use client";

import {
  PRODUCT_CATEGORIES,
  PRODUCT_UNITS,
  useProductStore,
} from "@/store/product-store";
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
import { Package } from "lucide-react";
import { getCategoryDescription } from "@/util/category-description-helper";

export function BasicInfoStep() {
  const { formData, updateField } = useProductStore();

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Product Name *</Label>
          <Input
            id="name"
            placeholder="e.g., Blue Dream, Lucky Club Gummies"
            value={formData.name || ""}
            onChange={(e) => updateField("name", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select
            value={formData.category || ""}
            onValueChange={(value) => updateField("category", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select product category" />
            </SelectTrigger>
            <SelectContent>
              {PRODUCT_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Choose the category that best describes this product
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit">Unit of Measurement *</Label>
          <Select
            value={formData.unit || ""}
            onValueChange={(value) => updateField("unit", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              {PRODUCT_UNITS.map((unit) => (
                <SelectItem key={unit} value={unit}>
                  {unit}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            How this product is measured and sold
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            placeholder="e.g., Sativa dominant hybrid, fruity flavor profile..."
            value={formData.description || ""}
            onChange={(e) => updateField("description", e.target.value)}
            rows={3}
          />
          <p className="text-sm text-muted-foreground">
            Describe the product&#39;s characteristics, effects, or flavor
          </p>
        </div>
      </div>

      {/* Category Info */}
      {formData.category && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-blue-600" />
              <div>
                <h4 className="font-medium text-blue-800">
                  Category: {formData.category}
                </h4>
                <p className="text-sm text-blue-700 mt-1">
                  {getCategoryDescription(formData.category)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
