import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const member = await prisma.member.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
        referredBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        referredMembers: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            createdAt: true,
          },
        },
        orders: {
          include: {
            items: {
              include: {
                product: {
                  select: {
                    name: true,
                    category: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        donations: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Transform the data to ensure consistent date formatting
    const transformedMember = {
      ...member,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
      orders: member.orders.map((order) => ({
        ...order,
        createdAt: order.createdAt,
        total: order.totalTokens, // Map totalTokens to total for compatibility
      })),
      donations: member.donations.map((donation) => ({
        ...donation,
        createdAt: donation.createdAt,
      })),
      referredMembers: member.referredMembers.map((ref) => ({
        ...ref,
        createdAt: ref.createdAt,
      })),
    };

    return NextResponse.json(transformedMember);
  } catch (error) {
    console.error("Error fetching member:", error);
    return NextResponse.json(
      { error: "Failed to fetch member" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const updateData = await request.json();

    // Remove fields that shouldn't be updated via this endpoint
    const {
      id: _id,
      createdAt,
      updatedAt,
      createdById,
      tokenBalance,
      ...validUpdateData
    } = updateData;

    const updatedMember = await prisma.member.update({
      where: { id },
      data: validUpdateData,
    });

    return NextResponse.json({
      ...updatedMember,
      createdAt: updatedMember.createdAt.toISOString(),
      updatedAt: updatedMember.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("Error updating member:", error);
    return NextResponse.json(
      { error: "Failed to update member" },
      { status: 500 },
    );
  }
}
