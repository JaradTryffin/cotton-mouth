import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

// GET - Fetch inventory movements with filters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const productId = url.searchParams.get("productId");
    const type = url.searchParams.get("type");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (productId) where.productId = productId;
    if (type) where.type = type;

    // Fetch inventory movements
    const movements = await prisma.inventoryMovement.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            category: true,
            unit: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const totalCount = await prisma.inventoryMovement.count({ where });

    return NextResponse.json({
      movements: movements.map((movement) => ({
        ...movement,
        createdAt: movement.createdAt.toISOString(),
        expiryDate: movement.expiryDate?.toISOString(),
      })),
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPage: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching inventory movements:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory movements" },
      { status: 500 },
    );
  }
}

// POST - Add new inventory (purchase/adjustment)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      productId,
      type,
      quantity,
      costPrice,
      reason,
      batchNumber,
      expiryDate,
    } = await request.json();

    // Validation
    if (!productId || !type || !quantity) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (quantity <= 0) {
      return NextResponse.json(
        { error: "Quantity must be positive" },
        { status: 400 },
      );
    }

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // For PURCHASE type, costPrice is required
    if (type === "PURCHASE" && (!costPrice || costPrice <= 0)) {
      return NextResponse.json(
        { error: "Cost price is required for purchases" },
        { status: 400 },
      );
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create inventory movement
      const movement = await tx.inventoryMovement.create({
        data: {
          productId,
          type,
          quantity:
            type === "WASTE" || (type === "ADJUSTMENT" && quantity < 0)
              ? -Math.abs(quantity)
              : quantity,
          costPrice: costPrice || null,
          reason,
          batchNumber,
          expiryDate: expiryDate ? new Date(expiryDate) : null,
          createdById: session.user.id,
        },
      });

      // Update product stock
      const stockChange =
        type === "WASTE"
          ? -Math.abs(quantity)
          : type === "ADJUSTMENT"
            ? quantity
            : quantity; // PURCHASE is positive

      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: {
          stock: {
            increment: stockChange,
          },
        },
      });
      return { movement, updatedProduct };
    });

    return NextResponse.json({
      success: true,
      movement: {
        ...result.movement,
        createdAt: result.movement.createdAt.toISOString(),
        expiryDate: result.movement.expiryDate?.toISOString(),
      },
      newStock: result.updatedProduct.stock,
    });
  } catch (error) {
    console.error("Error adding inventory: ", error);
    return NextResponse.json(
      { error: "Failed to add inventory" },
      { status: 500 },
    );
  }
}
