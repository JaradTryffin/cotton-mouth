import { getMemberById } from "@/util/actions/member";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { MemberDetailView } from "@/components/members/member-detail-view";

export default async function MemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const member = await getMemberById(id);

  if (!member) {
    notFound();
  }

  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<div>Loading...</div>}>
        <MemberDetailView member={member} />
      </Suspense>
    </div>
  );
}
