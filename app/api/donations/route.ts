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

    const { memberId, amount, method, notes } = await request.json();

    // Validation
    if (!memberId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid donation data" },
        { status: 400 },
      );
    }

    if (amount > 10000) {
      return NextResponse.json(
        { error: "Donation amount cannot exceed R10,000" },
        { status: 400 },
      );
    }

    // Verify member exists and is active
    const member = await prisma.member.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    if (!member.isActive) {
      return NextResponse.json(
        { error: "Cannot process donation for inactive member" },
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
      const updatedMember = await tx.member.update({
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
          description: notes
            ? `Donation: R${amount} = ${tokensToIssue} tokens. Notes: ${notes}`
            : `Donation: R${amount} = ${tokensToIssue} tokens`,
          relatedId: donation.id,
        },
      });

      return {
        donation,
        newBalance: updatedMember.tokenBalance,
      };
    });

    return NextResponse.json({
      success: true,
      donation: {
        id: result.donation.id,
        amount: result.donation.amount,
        tokensIssued: result.donation.tokensIssued,
        method: result.donation.method,
        createdAt: result.donation.createdAt,
      },
      tokensIssued: tokensToIssue,
      newBalance: result.newBalance,
      member: {
        id: member.id,
        firstName: member.firstName,
        lastName: member.lastName,
      },
    });
  } catch (error) {
    console.error("Error processing donation:", error);
    return NextResponse.json(
      { error: "Failed to process donation" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const url = new URL(request.url);
    const memberId = url.searchParams.get("memberId");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (memberId) {
      where.memberId = memberId;
    }

    // Get donations with pagination
    const donations = await prisma.donation.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Get total count for pagination
    const totalCount = await prisma.donation.count({ where });

    // Transform the data
    const transformedDonations = donations.map((donation) => ({
      ...donation,
      createdAt: donation.createdAt.toISOString(),
    }));

    return NextResponse.json({
      donations: transformedDonations,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching donations:", error);
    return NextResponse.json(
      { error: "Failed to fetch donations" },
      { status: 500 },
    );
  }
}
