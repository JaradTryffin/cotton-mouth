import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {hash} from "bcrypt";

export async function GET() {
  try {
    // Test the connection by counting users
    const userCount = await prisma.user.count();
    const hashedPassword = await hash("Admin123!", 10);
console.log('pass:',hashedPassword)

    return NextResponse.json({
      status: "Connected to database",
      userCount,
    });
  } catch (error) {
    console.error("Database connection error:", error);
    return NextResponse.json(
      { error: "Failed to connect to database" },
      { status: 500 },
    );
  }
}
