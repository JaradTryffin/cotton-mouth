"use client";

import { useDispensingStore } from "@/store/dispensing-store";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Loader2, Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  tokenBalance: number;
  isActive: boolean;
  email?: string;
}



// Step 1: Member Selection
export function MemberSelectionStep() {
  const { formData, setMember } = useDispensingStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      const fetchMembers = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(
            `/api/members?search=${encodeURIComponent(searchTerm)}&limit=10`,
          );
          if (response.ok) {
            const data = await response.json();
            setMembers(data.members || []);
          }
        } catch (error) {
          console.error("Error fetching members:", error);
        } finally {
          setIsLoading(false);
        }
      };

      const debounce = setTimeout(fetchMembers, 300);
      return () => clearTimeout(debounce);
    } else {
      setMembers([]);
    }
  }, [searchTerm]);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="memberSearch">Search Member</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="memberSearch"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Type at least 2 characters to search
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Searching members...
          </div>
        )}

        {/* Search Results */}
        {members.length > 0 && (
          <div className="space-y-2">
            <Label>Search Results</Label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {members.map((member) => (
                <Card
                  key={member.id}
                  className={`cursor-pointer transition-colors hover:bg-accent ${
                    formData.member?.id === member.id
                      ? "ring-2 ring-primary"
                      : ""
                  }`}
                  onClick={() => setMember(member)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <User className="h-8 w-8 p-1.5 bg-muted rounded-full" />
                        <div>
                          <p className="font-medium">
                            {member.firstName} {member.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {member.email || "No email"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <Badge
                          variant={member.isActive ? "default" : "destructive"}
                        >
                          {member.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <p className="text-sm font-medium">
                          {member.tokenBalance} tokens
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Selected Member Display */}
        {formData.member && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <User className="h-5 w-5 text-green-600" />
                <h4 className="font-medium text-green-800">Selected Member</h4>
              </div>
              <div className="space-y-2 text-sm text-green-700">
                <div className="flex justify-between">
                  <span>Name:</span>
                  <span>
                    {formData.member.firstName} {formData.member.lastName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Token Balance:</span>
                  <span className="font-medium">
                    {formData.member.tokenBalance} tokens
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge
                    variant={
                      formData.member.isActive ? "default" : "destructive"
                    }
                    className="ml-auto"
                  >
                    {formData.member.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
