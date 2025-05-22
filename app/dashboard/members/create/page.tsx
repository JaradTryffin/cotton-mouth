import type { Metadata } from "next";
import MembershipForm from "@/components/members/membership-form";

export const metadata: Metadata = {
  title: "New Member Registration",
  description: "Register as a new member of our cannabis club",
};

export default function NewMemberPage() {
  return (
    <div className="p-5  h-full w-full py-10">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          New Member Registration
        </h1>
        <p className="text-muted-foreground">
          Please complete the form below to register as a new member.
        </p>
      </div>
      <MembershipForm />
    </div>
  );
}
