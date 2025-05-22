// app/dashboard/members/registration-success/page.tsx (updated)
"use client";

import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

export default function RegistrationSuccessPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  // Auto-redirect after countdown
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/dashboard/members");
    }, countdown * 1000);

    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [router]);

  return (
    <div className="h-full w-full p-5 container flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 rounded-full bg-green-100 p-3">
        <CheckCircle className="h-12 w-12 text-green-600" />
      </div>
      <h1 className="mb-2 text-2xl font-bold">Registration Complete!</h1>
      <p className="mb-6 text-muted-foreground">
        Thank you for registering a new member. Their application has been
        received and is being processed.
      </p>
      <div className="space-y-4 max-w-md">
        <div className="rounded-lg border bg-muted/50 p-4 text-left">
          <h3 className="mb-2 font-medium">What happens next?</h3>
          <ul className="ml-5 list-disc space-y-1 text-sm text-muted-foreground">
            <li>Member data is saved in the system</li>
            <li>Their ID information has been stored securely</li>
            <li>They can now visit the club and make purchases</li>
            <li>You can find them in the members list</li>
          </ul>
        </div>

        <p className="text-sm text-muted-foreground">
          You will be redirected to the members list in {countdown} seconds...
        </p>

        <div className="flex justify-center gap-4">
          <Button asChild className="w-48">
            <Link href="/dashboard/members">Return to Members List</Link>
          </Button>
          <Button asChild variant="outline" className="w-48">
            <Link href="/dashboard/members/create">Register Another Member</Link>
          </Button>
        </div>

      </div>
    </div>
  );
}
