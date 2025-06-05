"use client";

import { useDispensingStore } from "@/store/dispensing-store";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Minus,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: string;
  name: string;
  category: string;
  tokenPrice: number;
  stock: number;
  unit: string;
  description?: string;
}

export function ProductSelectionStep() {
  const { cart, addToCart, updateCartItem, removeFromCart, getCartTotal } =
    useDispensingStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchTerm) params.append("search", searchTerm);

        const response = await fetch(`/api/products?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setProducts(data.products || []);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [searchTerm]);

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      updateCartItem(productId, newQuantity);
    }
  };

  const getCartItemQuantity = (productId: string) => {
    return cart.find((item) => item.productId === productId)?.quantity || 0;
  };

  return (
    <div className="space-y-6">
      {/* Product Search */}
      <div className="space-y-2">
        <Label htmlFor="productSearch">Search Products</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="productSearch"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Shopping Cart Summary */}
      {cart.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
              <h4 className="font-medium text-blue-800">
                Shopping Cart ({cart.length} items)
              </h4>
            </div>
            <div className="space-y-2">
              {cart.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between text-sm"
                >
                  <span>{item.product.name}</span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() =>
                        handleQuantityChange(item.productId, item.quantity - 1)
                      }
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() =>
                        handleQuantityChange(item.productId, item.quantity + 1)
                      }
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <span className="w-16 text-right">{item.totalPrice}t</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-red-600"
                      onClick={() => removeFromCart(item.productId)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
              <div className="border-t pt-2 font-medium text-blue-800">
                Total: {getCartTotal()} tokens
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Product List */}
      <div className="space-y-2">
        <Label>Available Products</Label>
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Loading products...
          </div>
        ) : (
          <div className="grid gap-2">
            {products
              .filter((p) => p.stock > 0)
              .map((product) => {
                const cartQuantity = getCartItemQuantity(product.id);
                return (
                  <Card
                    key={product.id}
                    className="hover:shadow-sm transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h5 className="font-medium">{product.name}</h5>
                            <Badge variant="outline" className="text-xs">
                              {product.category}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span>
                              {product.tokenPrice} tokens/{product.unit}
                            </span>
                            <span>
                              Stock: {product.stock} {product.unit}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {cartQuantity > 0 ? (
                            <div className="flex items-center gap-2">
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8"
                                onClick={() =>
                                  handleQuantityChange(
                                    product.id,
                                    cartQuantity - 1,
                                  )
                                }
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center font-medium">
                                {cartQuantity}
                              </span>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8"
                                onClick={() =>
                                  handleQuantityChange(
                                    product.id,
                                    cartQuantity + 1,
                                  )
                                }
                                disabled={cartQuantity >= product.stock}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => addToCart(product, 1)}
                              disabled={product.stock === 0}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
