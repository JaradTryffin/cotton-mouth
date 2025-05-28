"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Eye,
  UserX,
  Download,
  X,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

// Type definitions
interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  membershipType: string;
  isActive: boolean;
  balance: number;
  createdAt: string;
  appLinked: boolean;
  referredBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface MembersResponse {
  members: Member[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

type SortDirection = "asc" | "desc" | null;
type SortField =
  | "name"
  | "email"
  | "membershipType"
  | "status"
  | "createdAt"
  | "balance"
  | null;

export function MembersTable() {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [membershipFilter, setMembershipFilter] = useState<string | null>(null);
  const [appLinkedFilter, setAppLinkedFilter] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const itemsPerPage = 10;

  // Fetch members from API
  const fetchMembers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      if (searchTerm) params.append("search", searchTerm);
      if (statusFilter) params.append("status", statusFilter);
      if (membershipFilter) params.append("membershipType", membershipFilter);
      if (appLinkedFilter) params.append("appLinked", appLinkedFilter);

      const response = await fetch(`/api/members?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch members");
      }

      const data: MembersResponse = await response.json();
      setMembers(data.members);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error("Failed to load members");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch members when dependencies change
  useEffect(() => {
    fetchMembers();
  }, [
    currentPage,
    searchTerm,
    statusFilter,
    membershipFilter,
    appLinkedFilter,
  ]);

  // Handle sort toggle (client-side sorting for simplicity)
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortField(null);
        setSortDirection(null);
      }
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Apply client-side sorting
  const sortedMembers = [...members].sort((a, b) => {
    if (!sortField || !sortDirection) return 0;

    let valueA: any, valueB: any;

    switch (sortField) {
      case "name":
        valueA = `${a.firstName} ${a.lastName}`.toLowerCase();
        valueB = `${b.firstName} ${b.lastName}`.toLowerCase();
        break;
      case "email":
        valueA = a.email?.toLowerCase() || "";
        valueB = b.email?.toLowerCase() || "";
        break;
      case "membershipType":
        valueA = a.membershipType.toLowerCase();
        valueB = b.membershipType.toLowerCase();
        break;
      case "status":
        valueA = a.isActive;
        valueB = b.isActive;
        break;
      case "createdAt":
        valueA = new Date(a.createdAt).getTime();
        valueB = new Date(b.createdAt).getTime();
        break;
      case "balance":
        valueA = a.balance;
        valueB = b.balance;
        break;
      default:
        return 0;
    }

    if (sortDirection === "asc") {
      return valueA > valueB ? 1 : -1;
    } else {
      return valueA < valueB ? 1 : -1;
    }
  });

  // Get sort icon based on current sort state
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronsUpDown className="ml-1 h-4 w-4" />;
    }
    return sortDirection === "asc" ? (
      <ChevronUp className="ml-1 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-1 h-4 w-4" />
    );
  };

  // Handle checkbox selection
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(sortedMembers.map((member) => member.id));
    }
    setIsAllSelected(!isAllSelected);
  };

  const toggleSelectMember = (id: string) => {
    if (selectedMembers.includes(id)) {
      setSelectedMembers(selectedMembers.filter((memberId) => memberId !== id));
      setIsAllSelected(false);
    } else {
      setSelectedMembers([...selectedMembers, id]);
      if (selectedMembers.length + 1 === sortedMembers.length) {
        setIsAllSelected(true);
      }
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter(null);
    setMembershipFilter(null);
    setAppLinkedFilter(null);
    setSortField(null);
    setSortDirection(null);
    setCurrentPage(1);
  };

  // Check if any filters are active
  const hasActiveFilters =
    searchTerm ||
    statusFilter ||
    membershipFilter ||
    appLinkedFilter ||
    sortField;

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedMembers([]);
    setIsAllSelected(false);
  };

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-10">
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchMembers} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-9 w-9"
              onClick={() => setSearchTerm("")}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <div className="p-2">
                <p className="mb-2 text-sm font-medium">Status</p>
                <Select
                  value={statusFilter || "all"}
                  onValueChange={(value) =>
                    setStatusFilter(value === "all" ? null : value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DropdownMenuSeparator />

              <div className="p-2">
                <p className="mb-2 text-sm font-medium">Membership Type</p>
                <Select
                  value={membershipFilter || "all"}
                  onValueChange={(value) =>
                    setMembershipFilter(value === "all" ? null : value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DropdownMenuSeparator />

              <div className="p-2">
                <p className="mb-2 text-sm font-medium">App Status</p>
                <Select
                  value={appLinkedFilter || "all"}
                  onValueChange={(value) =>
                    setAppLinkedFilter(value === "all" ? null : value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All app statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All app statuses</SelectItem>
                    <SelectItem value="linked">App Linked</SelectItem>
                    <SelectItem value="not-linked">Not Linked</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {hasActiveFilters && (
                <>
                  <DropdownMenuSeparator />
                  <div className="p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={resetFilters}
                    >
                      Reset all filters
                    </Button>
                  </div>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="flex items-center gap-1"
            >
              <X className="h-4 w-4" />
              <span>Clear filters</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={() => toast.info("Export functionality coming soon")}
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* Active filters display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {searchTerm && (
            <Badge variant="outline" className="flex items-center gap-1">
              <span>Search: {searchTerm}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0"
                onClick={() => setSearchTerm("")}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove search filter</span>
              </Button>
            </Badge>
          )}

          {statusFilter && (
            <Badge variant="outline" className="flex items-center gap-1">
              <span>
                Status: {statusFilter === "active" ? "Active" : "Inactive"}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0"
                onClick={() => setStatusFilter(null)}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove status filter</span>
              </Button>
            </Badge>
          )}

          {membershipFilter && (
            <Badge variant="outline" className="flex items-center gap-1">
              <span>
                Membership:{" "}
                {membershipFilter.charAt(0).toUpperCase() +
                  membershipFilter.slice(1)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0"
                onClick={() => setMembershipFilter(null)}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove membership filter</span>
              </Button>
            </Badge>
          )}

          {appLinkedFilter && (
            <Badge variant="outline" className="flex items-center gap-1">
              <span>
                App: {appLinkedFilter === "linked" ? "Linked" : "Not Linked"}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0"
                onClick={() => setAppLinkedFilter(null)}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove app filter</span>
              </Button>
            </Badge>
          )}
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all members"
                    />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center">
                      <span>Name</span>
                      {getSortIcon("name")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("email")}
                  >
                    <div className="flex items-center">
                      <span>Contact</span>
                      {getSortIcon("email")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("membershipType")}
                  >
                    <div className="flex items-center">
                      <span>Membership</span>
                      {getSortIcon("membershipType")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center">
                      <span>Status</span>
                      {getSortIcon("status")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("balance")}
                  >
                    <div className="flex items-center">
                      <span>Balance</span>
                      {getSortIcon("balance")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("createdAt")}
                  >
                    <div className="flex items-center">
                      <span>Joined</span>
                      {getSortIcon("createdAt")}
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        Loading members...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : sortedMembers.length > 0 ? (
                  sortedMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedMembers.includes(member.id)}
                          onCheckedChange={() => toggleSelectMember(member.id)}
                          aria-label={`Select ${member.firstName} ${member.lastName}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {member.firstName} {member.lastName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ID: {member.id.slice(0, 8)}...
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>{member.email || "No email"}</div>
                        <div className="text-xs text-muted-foreground">
                          {member.phoneNumber || "No phone"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            member.membershipType === "vip"
                              ? "default"
                              : member.membershipType === "premium"
                                ? "outline"
                                : "secondary"
                          }
                        >
                          {member.membershipType.charAt(0).toUpperCase() +
                            member.membershipType.slice(1)}
                        </Badge>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {member.appLinked ? "App Linked" : "Not Linked"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            member.isActive ? "secondary" : "destructive"
                          }
                        >
                          {member.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>R{member.balance.toFixed(2)}</TableCell>
                      <TableCell>
                        {format(new Date(member.createdAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/dashboard/members/${member.id}`}
                                className="flex items-center"
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                <span>View details</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/dashboard/members/${member.id}/edit`}
                                className="flex items-center"
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit member</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() =>
                                toast.info("Member status toggle coming soon")
                              }
                            >
                              <UserX className="mr-2 h-4 w-4" />
                              <span>
                                {member.isActive ? "Deactivate" : "Activate"}
                              </span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No members found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing{" "}
          <strong>
            {pagination.total === 0
              ? 0
              : (pagination.page - 1) * pagination.limit + 1}
          </strong>{" "}
          to{" "}
          <strong>
            {Math.min(pagination.page * pagination.limit, pagination.total)}
          </strong>{" "}
          of <strong>{pagination.total}</strong> members
        </div>

        {pagination.totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() =>
                    handlePageChange(Math.max(pagination.page - 1, 1))
                  }
                  className={
                    pagination.page <= 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {Array.from({ length: Math.min(pagination.totalPages, 5) }).map(
                (_, i) => {
                  let pageNumber: number;

                  // Logic to show pages around current page
                  if (pagination.totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNumber = i + 1;
                  } else if (pagination.page >= pagination.totalPages - 2) {
                    pageNumber = pagination.totalPages - 4 + i;
                  } else {
                    pageNumber = pagination.page - 2 + i;
                  }

                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        isActive={pagination.page === pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className="cursor-pointer"
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                },
              )}

              {pagination.totalPages > 5 &&
                pagination.page < pagination.totalPages - 2 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    handlePageChange(
                      Math.min(pagination.page + 1, pagination.totalPages),
                    )
                  }
                  className={
                    pagination.page >= pagination.totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
}
