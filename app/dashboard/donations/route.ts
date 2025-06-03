import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { memberId, amount, method } = await request.json();

    if (!memberId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid donation data" },
        { status: 400 },
      );
    }

    // Convert R1 = 1 token (1:1 ratio)
    const tokensToIssue = amount;

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create donation record
      const donation = await tx.donation.create({
        data: {
          amount: amount,
          tokensIssued: tokensToIssue,
          method: method,
          memberId: memberId,
        },
      });

      // Update member token balance
      await tx.member.update({
        where: { id: memberId },
        data: {
          tokenBalance: {
            increment: tokensToIssue,
          },
        },
      });

      // Create token transaction record
      await tx.tokenTransaction.create({
        data: {
          memberId: memberId,
          amount: tokensToIssue,
          type: "DONATION",
          description: `Donation: R${amount} = ${tokensToIssue} tokens`,
          relatedId: donation.id,
        },
      });

      return donation;
    });

    return NextResponse.json({
      success: true,
      donation: result,
      tokensIssued: tokensToIssue,
    });
  } catch (error) {
    console.error("Error processing donation:", error);
    return NextResponse.json(
      { error: "Failed to process donation" },
      { status: 500 },
    );
  }
}
