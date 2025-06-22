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

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        inventoryMovements: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            createdBy: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        orderItems: {
          take: 10,
          orderBy: { order: { createdAt: "desc" } },
          include: {
            order: {
              include: {
                member: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Transform the data
    const transformedProduct = {
      ...product,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
      inventoryMovements: product.inventoryMovements.map((movement) => ({
        ...movement,
        createdAt: movement.createdAt.toISOString(),
        expiryDate: movement.expiryDate?.toISOString(),
      })),
      orderItems: product.orderItems.map((item) => ({
        ...item,
        order: {
          ...item.order,
          createdAt: item.order.createdAt.toISOString(),
        },
      })),
    };

    return NextResponse.json(transformedProduct);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
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

    // Validation
    if (updateData.tokenPrice !== undefined && updateData.tokenPrice <= 0) {
      return NextResponse.json(
        { error: "Token price must be greater than 0" },
        { status: 400 },
      );
    }

    if (updateData.costPrice !== undefined && updateData.costPrice <= 0) {
      return NextResponse.json(
        { error: "Cost price must be greater than 0" },
        { status: 400 },
      );
    }

    // Remove fields that shouldn't be updated via this endpoint
    const {
      id: _id,
      createdAt,
      updatedAt,
      stock, // Stock is managed through inventory movements
      ...validUpdateData
    } = updateData;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: validUpdateData,
    });

    return NextResponse.json({
      ...updatedProduct,
      createdAt: updatedProduct.createdAt.toISOString(),
      updatedAt: updatedProduct.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if product has any inventory movements or order items
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        inventoryMovements: true,
        orderItems: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Prevent deletion if product has history
    if (
      product.inventoryMovements.length > 0 ||
      product.orderItems.length > 0
    ) {
      return NextResponse.json(
        {
          error:
            "Cannot delete product with inventory movements or order history. Consider deactivating instead.",
        },
        { status: 400 },
      );
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 },
    );
  }
}
