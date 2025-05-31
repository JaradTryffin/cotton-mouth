import type { Metadata } from "next";
import Link from "next/link";
import {Plus, PlusCircle} from "lucide-react";

import { Button } from "@/components/ui/button";
import { MembersTable } from "@/components/members/members-table";
import MembershipForm from "@/components/members/membership-form";

export const metadata: Metadata = {
  title: "Members | Cotton Mouth",
  description: "Manage your club members",
};

export default function MembersPage() {
  return (
    <div className="p-5 container mx-auto py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Members</h1>
          <p className="text-muted-foreground">
            Manage and view all club members
          </p>
        </div>
        {/*<Button asChild>*/}
        {/*  <Link*/}
        {/*    href="/dashboard/members/create"*/}
        {/*    className="flex items-center gap-1"*/}
        {/*  >*/}
        {/*    <PlusCircle className="mr-1 h-4 w-4" />*/}
        {/*    New Member*/}
        {/*  </Link>*/}
        {/*</Button>*/}
        <MembershipForm trigger={ <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create New Member
        </Button>}/>
      </div>

      <MembersTable />
    </div>
  );
}
