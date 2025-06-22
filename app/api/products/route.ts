import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const category = url.searchParams.get("category");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category) {
      where.category = category;
    }

    // Fetch products
    const products = await prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });

    const totalCount = await prisma.product.count({ where });

    // Transform data
    const transformedProducts = products.map((product) => ({
      ...product,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      products: transformedProducts,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      name,
      category,
      description,
      tokenPrice,
      costPrice,
      sellingPrice,
      unit,
      jarWeight,
      displayOnApp,
      allowGifting,
      ignoreDiscounts,
    } = await request.json();

    // Validation
    if (!name || !category || !tokenPrice || !costPrice || !unit) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (tokenPrice <= 0 || costPrice <= 0) {
      return NextResponse.json(
        { error: "Prices must be positive" },
        { status: 400 },
      );
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        category,
        description,
        tokenPrice,
        costPrice,
        sellingPrice,
        unit,
        jarWeight,
        displayOnApp: displayOnApp ?? true,
        allowGifting: allowGifting ?? false,
        ignoreDiscounts: ignoreDiscounts ?? false,
      },
    });

    return NextResponse.json({
      success: true,
      product: {
        ...product,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 },
    );
  }
}
