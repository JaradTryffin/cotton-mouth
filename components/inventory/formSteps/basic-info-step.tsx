"use client";

import { useInventoryStore } from "@/store/inventory-store";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, Loader2, Package, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface Product {
  id: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
  tokenPrice: number;
  costPrice?: number;
}

export function BasicInfoStep() {
  const { formData, updateField } = useInventoryStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/products");
        if (response.ok) {
          const data = await response.json();
          console.log("data",data)
          setProducts(data.products || []);
        }
      } catch (error) {
        console.error("Error fetching products: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  console.log("products",products)

  const selectedProduct = products.find((p) => p.id === formData.productId);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Product</Label>
          <Select
            value={formData.productId || ""}
            onValueChange={(value) => updateField("productId", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a product" />
            </SelectTrigger>
            <SelectContent>
              {isLoading ? (
                <div className="flex item-center justify-center p-4">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Loading products...
                </div>
              ) : (
                products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    <div className="flex item-center justify-between w-full">
                      <span>{product.name}</span>
                      <div className="flex items-center gap-2 ml-4">
                        <Badge variant="outline" className="text-xs">
                          {product.category}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {product.stock} {product.unit}
                        </Badge>
                      </div>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {selectedProduct && (
            <div className="text-sm text-muted-foreground">
              Current stock: {selectedProduct.stock} {selectedProduct.unit}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Movement Type</Label>
          <Select
            value={formData.type || ""}
            onValueChange={(value) => updateField("type", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select movement type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PURCHASE">
                <div className="flex item-center gap-2">
                  <Plus className="h-4 w-4 text-green-600" />
                  <span>Purchase (Add Stock)</span>
                </div>
              </SelectItem>

              <SelectItem value="ADJUSTMENT">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-600" />
                  <span>Stock Adjustment</span>
                </div>
              </SelectItem>

              <SelectItem value="WASTE">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span>Waste/Loss</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>
            Quantity {selectedProduct && `(${selectedProduct.unit})`}
          </Label>
          <Input
            id="quantity"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={formData.quantity || ""}
            onChange={(e) =>
              updateField("quantity", parseFloat(e.target.value) || 0)
            }
          />
        </div>
      </div>

      {/*    Movement Type Info*/}
      {formData.type && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex item-start gap-3">
              {formData.type === "PURCHASE" && (
                <Plus className="h-5 w-5 text-green-600 mt-0.5" />
              )}
              {formData.type === "ADJUSTMENT" && (
                <Package className="h-5 w-5 text-blue-600 mt-0.5" />
              )}
              {formData.type === "WASTE" && (
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              )}
              <div>
                <h4 className="font-medium text-blue-800">
                  {formData.type === "PURCHASE" && "Stock Purchase"}
                  {formData.type === "ADJUSTMENT" && "Stock Adjustment"}
                  {formData.type === "WASTE" && "Waste/Loss Recording"}
                </h4>
                <p className="text-sm text-blue-700 mt-1">
                  {formData.type === "PURCHASE" &&
                    "Add new inventory you've purchased from suppliers"}
                  {formData.type === "ADJUSTMENT" &&
                    "Correct stock levels due to counting discrepancies"}
                  {formData.type === "WASTE" &&
                    "Record products that were damaged, expired, or lost"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
