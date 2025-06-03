"use server";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getMemberById(id: string) {
  try {
    const member = await prisma.member.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true,
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
        referredMembers: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            createdAt: true,
          },
        },
        referredBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!member) return null;

    // Map the new field names to the old ones for backward compatibility
    return {
      ...member,
      orders: member.orders.map(order => ({
        ...order,
        total: order.totalTokens, // Map totalTokens back to total
        items: order.items.map(item => ({
          ...item,
          price: item.tokenPrice, // Map tokenPrice back to price
        })),
      })),
    };
  } catch (error) {
    console.error("Error fetching member:", error);
    return null;
  }
}

export async function updateMember(
  id: string,
  data: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    membershipType: string;
    isActive: boolean;
    appLinked: boolean;
    username: string;
  },
) {
  try {
    return await prisma.member.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email || null,
        phoneNumber: data.phoneNumber || null,
        membershipType: data.membershipType,
        isActive: data.isActive,
        appLinked: data.appLinked,
        username: data.username || null,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Error updating member:", error);
    throw new Error("Failed to update member");
  }
}
