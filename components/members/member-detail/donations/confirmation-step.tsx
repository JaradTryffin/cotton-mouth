"use client";
import { useDonationStore } from "@/store/donation-store";
import { useEffect, useState } from "react";
import { CreditCard, FileText, Loader2, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  membershipType: string;
  tokenBalance: number;
}

export function ConfirmationStep() {
  const { formData, isSubmitting } = useDonationStore();
  const [member, setMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch member details
  useEffect(() => {
    const fetchMember = async () => {
      if (!formData.memberId) return;

      setIsLoading(true);
      try {
        const response = await fetch(`/api/members/${formData.memberId}`);
        if (response.ok) {
          const memberData = await response.json();
          setMember(memberData);
        }
      } catch (error) {
        console.error("Error fetching member:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMember();
  }, [formData.memberId]);

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "cash":
        return "Cash";
      case "card":
        return "Card Payment";
      case "eft":
        return "EFT/Bank Transfer";
      case "other":
        return "Other";
      default:
        return method;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading member details...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Confirm Donation Details</h3>
        <p className="text-sm text-muted-foreground">
          Please review the information below before processing the donation
        </p>
      </div>

      {/* Member Information */}
      {member && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <h4 className="font-medium">Member Information</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">
                  {member.firstName} {member.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{member.email || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Membership Type</p>
                <Badge variant="outline">{member.membershipType}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Balance</p>
                <p className="font-medium">R{member.tokenBalance.toFixed(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Donation Details */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            R<h4 className="font-medium">Donation Details</h4>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-medium">
                R{formData.amount?.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Method</span>
              <span className="font-medium">
                {getPaymentMethodLabel(formData.method || "")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tokens to Issue</span>
              <span className="font-medium text-green-600">
                {formData.amount?.toFixed(0)} tokens
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date</span>
              <span className="font-medium">{format(new Date(), "PPP")}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Balance After Donation */}
      {member && formData.amount && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <CreditCard className="h-5 w-5 text-green-600" />
              <h4 className="font-medium text-green-800">
                Balance After Donation
              </h4>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-green-700">New Token Balance</span>
              <span className="text-lg font-bold text-green-800">
                R{(member.tokenBalance + formData.amount).toFixed(0)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {formData.notes && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <h4 className="font-medium">Notes</h4>
            </div>
            <p className="text-sm text-muted-foreground">{formData.notes}</p>
          </CardContent>
        </Card>
      )}

      {isSubmitting && (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          <span>Processing donation...</span>
        </div>
      )}
    </div>
  );
}
