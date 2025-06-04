"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Edit,
  Save,
  X,
  DollarSign,
  ShoppingCart,
  Users,
  FileText,
  Smartphone,
} from "lucide-react";
import { updateMember } from "@/util/actions/member";
import { useRouter } from "next/navigation";
import DonationForm from "@/components/members/member-detail/donations/donation-form";

interface MemberDetailViewProps {
  member: {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phoneNumber: string | null;
    membershipType: string;
    tokenBalance: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    idFront: string | null;
    idBack: string | null;
    appLinked: boolean;
    username: string | null;
    referredById: string | null;
    createdBy: {
      name: string;
      email: string;
    };
    orders: Array<{
      id: string;
      total: number;
      status: string;
      createdAt: Date;
      items: Array<{
        id: string;
        quantity: number;
        price: number;
        product: {
          name: string;
          category: string;
        };
      }>;
    }>;
    donations: Array<{
      id: string;
      amount: number;
      method: string;
      createdAt: Date;
    }>;
    referredMembers: Array<{
      id: string;
      firstName: string;
      lastName: string;
      createdAt: Date;
    }>;
    referredBy: {
      id: string;
      firstName: string;
      lastName: string;
    } | null;
  };
}

export function MemberDetailView({ member }: MemberDetailViewProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editedMember, setEditedMember] = useState({
    firstName: member.firstName,
    lastName: member.lastName,
    email: member.email || "",
    phoneNumber: member.phoneNumber || "",
    membershipType: member.membershipType,
    isActive: member.isActive,
    appLinked: member.appLinked,
    username: member.username || "",
  });

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const handleSave = async () => {
    try {
      await updateMember(member.id, editedMember);
      setIsEditing(false);
      router.refresh();
      // You might want to refresh the data here
    } catch (error) {
      console.error("Failed to update member:", error);
    }
  };

  const handleCancel = () => {
    setEditedMember({
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email || "",
      phoneNumber: member.phoneNumber || "",
      membershipType: member.membershipType,
      isActive: member.isActive,
      appLinked: member.appLinked,
      username: member.username || "",
    });
    setIsEditing(false);
  };

  const totalSpent = member.orders.reduce((sum, order) => sum + order.total, 0);
  const totalDonations = member.donations.reduce(
    (sum, donation) => sum + donation.amount,
    0,
  );

  return (
    <div className="space-y-6 m-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={`/placeholder.svg?height=80&width=80`} />
            <AvatarFallback className="text-lg">
              {member.firstName[0]}
              {member.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">
              {member.firstName} {member.lastName}
            </h1>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant={member.isActive ? "default" : "secondary"}>
                {member.isActive ? "Active" : "Inactive"}
              </Badge>
              <Badge variant="outline">{member.membershipType}</Badge>
              {member.appLinked && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Smartphone className="h-3 w-3" />
                  App Linked
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">
              Member since {member.createdAt.toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <Button onClick={handleSave} size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button onClick={handleCancel} variant="outline" size="sm">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Token Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {member.tokenBalance.toFixed(0)} tokens
            </div>
            <p className="text-xs text-muted-foreground">
              Equivalent to R{member.tokenBalance.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSpent.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{member.orders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {member.referredMembers.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList>
          <TabsTrigger value="personal">Personal Information</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="donations">Donations</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Member details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  {isEditing ? (
                    <Input
                      id="firstName"
                      value={editedMember.firstName}
                      onChange={(e) =>
                        setEditedMember({
                          ...editedMember,
                          firstName: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <div className="p-2 bg-muted rounded">
                      {member.firstName}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  {isEditing ? (
                    <Input
                      id="lastName"
                      value={editedMember.lastName}
                      onChange={(e) =>
                        setEditedMember({
                          ...editedMember,
                          lastName: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <div className="p-2 bg-muted rounded">
                      {member.lastName}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={editedMember.email}
                      onChange={(e) =>
                        setEditedMember({
                          ...editedMember,
                          email: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <div className="p-2 bg-muted rounded">
                      {member.email || "Not provided"}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  {isEditing ? (
                    <Input
                      id="phoneNumber"
                      value={editedMember.phoneNumber}
                      onChange={(e) =>
                        setEditedMember({
                          ...editedMember,
                          phoneNumber: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <div className="p-2 bg-muted rounded">
                      {member.phoneNumber || "Not provided"}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="membershipType">Membership Type</Label>
                  {isEditing ? (
                    <Select
                      value={editedMember.membershipType}
                      onValueChange={(value) =>
                        setEditedMember({
                          ...editedMember,
                          membershipType: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="vip">VIP</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="p-2 bg-muted rounded">
                      {member.membershipType}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">App Username</Label>
                  {isEditing ? (
                    <Input
                      id="username"
                      value={editedMember.username}
                      onChange={(e) =>
                        setEditedMember({
                          ...editedMember,
                          username: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <div className="p-2 bg-muted rounded">
                      {member.username || "Not set"}
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Active Status</Label>
                    <p className="text-sm text-muted-foreground">
                      Member can make purchases
                    </p>
                  </div>
                  {isEditing ? (
                    <Switch
                      checked={editedMember.isActive}
                      onCheckedChange={(checked) =>
                        setEditedMember({ ...editedMember, isActive: checked })
                      }
                    />
                  ) : (
                    <Badge variant={member.isActive ? "default" : "secondary"}>
                      {member.isActive ? "Active" : "Inactive"}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>App Integration</Label>
                    <p className="text-sm text-muted-foreground">
                      Member linked to mobile app
                    </p>
                  </div>
                  {isEditing ? (
                    <Switch
                      checked={editedMember.appLinked}
                      onCheckedChange={(checked) =>
                        setEditedMember({ ...editedMember, appLinked: checked })
                      }
                    />
                  ) : (
                    <Badge variant={member.appLinked ? "default" : "secondary"}>
                      {member.appLinked ? "Linked" : "Not Linked"}
                    </Badge>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Created By</Label>
                <div className="p-2 bg-muted rounded">
                  {member.createdBy.name} ({member.createdBy.email})
                </div>
              </div>

              {member.referredBy && (
                <div className="space-y-2">
                  <Label>Referred By</Label>
                  <div className="p-2 bg-muted rounded">
                    {member.referredBy.firstName} {member.referredBy.lastName}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
              <CardDescription>
                All orders placed by this member
              </CardDescription>
            </CardHeader>
            <CardContent>
              {member.orders.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {member.orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-sm">
                          {order.id.slice(0, 8)}...
                        </TableCell>
                        <TableCell>
                          {order.createdAt.toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {order.items.map((item) => (
                              <div key={item.id} className="text-sm">
                                {item.quantity}x {item.product.name}
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              order.status === "completed"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${order.total.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No orders found for this member.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="donations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Donation History</CardTitle>
              <CardDescription>
                All donations made by this member
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DonationForm
                memberId={member.id}
                trigger={
                  <Button size="sm" variant="outline">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Add Donation
                  </Button>
                }
              />
              {member.donations.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {member.donations.map((donation) => (
                      <TableRow key={donation.id}>
                        <TableCell>
                          {donation.createdAt.toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{donation.method}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          R{donation.amount.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No donations found for this member.
                </div>
              )}
              {totalDonations > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center font-medium">
                    <span>Total Donations:</span>
                    <span>R{totalDonations.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referrals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Referral Network</CardTitle>
              <CardDescription>Members referred by this member</CardDescription>
            </CardHeader>
            <CardContent>
              {member.referredMembers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Joined Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {member.referredMembers.map((referredMember) => (
                      <TableRow key={referredMember.id}>
                        <TableCell>
                          {referredMember.firstName} {referredMember.lastName}
                        </TableCell>
                        <TableCell>
                          {referredMember.createdAt.toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  This member hasn&#39;t referred anyone yet.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
