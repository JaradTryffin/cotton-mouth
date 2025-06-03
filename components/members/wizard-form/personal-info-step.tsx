"use client";

import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMembershipStore } from "@/store/membership-store";

export function PersonalInfoStep() {
  const { formData, updateField } = useMembershipStore();

  // Calculate max date (21 years ago)
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 21);
  const maxDateString = format(maxDate, "yyyy-MM-dd");

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    if (dateValue) {
      const date = new Date(dateValue + "T00:00:00"); // Prevent timezone issues
      updateField("dateOfBirth", date);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            placeholder="John"
            value={formData.firstName || ""}
            onChange={(e) => updateField("firstName", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            placeholder="Doe"
            value={formData.lastName || ""}
            onChange={(e) => updateField("lastName", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dateOfBirth">Date of Birth</Label>
        <Input
          id="dateOfBirth"
          type="date"
          value={
            formData.dateOfBirth
              ? format(formData.dateOfBirth, "yyyy-MM-dd")
              : ""
          }
          onChange={handleDateChange}
          max={maxDateString}
          className="w-full"
        />
        <p className="text-sm text-muted-foreground">
          You must be at least 21 years old to register.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address (Optional)</Label>
          <Input
            id="email"
            type="email"
            placeholder="john.doe@example.com"
            value={formData.email || ""}
            onChange={(e) => updateField("email", e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            For order notifications and updates
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            id="phoneNumber"
            placeholder="(555) 123-4567"
            value={formData.phoneNumber || ""}
            onChange={(e) => updateField("phoneNumber", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
