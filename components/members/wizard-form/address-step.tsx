"use client";

import { useMembershipStore } from "@/store/membership-store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AddressStep() {
  const { formData, updateField } = useMembershipStore();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="address">Street Address</Label>
        <Input
          id="address"
          placeholder="123 Main St"
          value={formData.address || ""}
          onChange={(e) => updateField("address", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            placeholder="Anytown"
            value={formData.city || ""}
            onChange={(e) => updateField("city", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            placeholder="KZN"
            value={formData.state || ""}
            onChange={(e) => updateField("state", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="zipCode">ZIP code</Label>
          <Input
            id="zipCode"
            placeholder="1234"
            value={formData.zipCode || ""}
            onChange={(e) => updateField("zipCode", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="space-y-2">Membership Type</Label>
        <Select
          value={formData.membershipType || "standard"}
          onValueChange={(value) => updateField("membershipType", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a membership type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="standard">Standard</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
            <SelectItem value="vip">VIP</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          Different membership types offer different benefits and discounts
        </p>
      </div>
    </div>
  );
}
