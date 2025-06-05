import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

interface DispenseItem {
  productId: string;
  quantity: number;
}

interface DispenseRequest {
  memberId: string;
  items: DispenseItem[];
  notes?: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { memberId, items, notes }: DispenseRequest = await request.json();

    // Validation
    if (!memberId || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Member ID and items are required" },
        { status: 400 },
      );
    }

    // Validate all items have positive quantities
    for (const item of items) {
      if (!item.productId || item.quantity <= 0) {
        return NextResponse.json(
          {
            error: "All items must have valid product ID and positive quantity",
          },
          { status: 400 },
        );
      }
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Verify member exists and is active
      const member = await tx.member.findUnique({
        where: { id: memberId },
      });

      if (!member) {
        throw new Error("Member not found");
      }

      if (!member.isActive) {
        throw new Error("Member account is inactive");
      }

      // 2. Get all products and verify they exist and have sufficient stock
      const productIds = items.map((item) => item.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
      });

      if (products.length !== productIds.length) {
        throw new Error("One or more products not found");
      }

      // 3. Calculate total cost and validate stock availability
      let totalTokens = 0;
      const productMap = new Map(products.map((p) => [p.id, p]));

      for (const item of items) {
        const product = productMap.get(item.productId)!;

        // Check stock availability
        if (product.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
          );
        }

        // Calculate cost
        totalTokens += product.tokenPrice * item.quantity;
      }

      // 4. Check if member has sufficient token balance
      if (member.tokenBalance < totalTokens) {
        throw new Error(
          `Insufficient token balance. Required: ${totalTokens}, Available: ${member.tokenBalance}`,
        );
      }

      // 5. Create the order
      const order = await tx.order.create({
        data: {
          memberId,
          totalTokens,
          status: "completed",
        },
      });

      // 6. Create order items and update product stock
      const orderItems = [];
      for (const item of items) {
        const product = productMap.get(item.productId)!;

        // Create order item
        const orderItem = await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            tokenPrice: product.tokenPrice,
          },
        });
        orderItems.push(orderItem);

        // Update product stock
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        // Create inventory movement for the sale
        await tx.inventoryMovement.create({
          data: {
            productId: item.productId,
            type: "SALE",
            quantity: -item.quantity, // Negative because it's going out
            reason: `Sale to ${member.firstName} ${member.lastName}`,
            createdById: session.user.id,
            orderId: order.id,
          },
        });
      }

      // 7. Deduct tokens from member balance
      const updatedMember = await tx.member.update({
        where: { id: memberId },
        data: {
          tokenBalance: {
            decrement: totalTokens,
          },
        },
      });

      // 8. Create token transaction record
      await tx.tokenTransaction.create({
        data: {
          memberId,
          amount: -totalTokens, // Negative because tokens are being spent
          type: "PURCHASE",
          description: notes
            ? `Purchase: ${items.length} item(s). Notes: ${notes}`
            : `Purchase: ${items.length} item(s)`,
          relatedId: order.id,
        },
      });

      return {
        order,
        orderItems,
        newTokenBalance: updatedMember.tokenBalance,
        totalTokensSpent: totalTokens,
      };
    });

    return NextResponse.json({
      success: true,
      order: {
        ...result.order,
        createdAt: result.order.createdAt.toISOString(),
      },
      items: result.orderItems,
      tokensSpent: result.totalTokensSpent,
      newBalance: result.newTokenBalance,
    });
  } catch (error) {
    console.error("Error processing dispensing:", error);

    // Return specific error messages
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to process dispensing" },
      { status: 500 },
    );
  }
}

// GET - Fetch recent dispensing transactions
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    // Fetch orders (dispensing transactions)
    const orders = await prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                category: true,
                unit: true,
              },
            },
          },
        },
      },
    });

    const totalCount = await prisma.order.count({ where });

    // Transform the data
    const transformedOrders = orders.map((order) => ({
      ...order,
      createdAt: order.createdAt.toISOString(),
      total: order.totalTokens, // For compatibility
    }));

    return NextResponse.json({
      orders: transformedOrders,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching dispensing history:", error);
    return NextResponse.json(
      { error: "Failed to fetch dispensing history" },
      { status: 500 },
    );
  }
}
