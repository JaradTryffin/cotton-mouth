// app/api/members/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

interface MemberFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  email?: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  membershipType: string;
  idFront: string;
  idBack: string;
  termsAgreed: boolean;
  signature: string;
  referrerId?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const formData: MemberFormData = await request.json();

    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.phoneNumber) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Create member directory
    const memberFilesDir = path.join(
        process.env.HOME || process.env.USERPROFILE || "",
        "Documents",
        "cotton-mouth",
        "members"
    );
    if (!fs.existsSync(memberFilesDir)) {
      fs.mkdirSync(memberFilesDir, { recursive: true });
    }

    const memberId = uuidv4();
    const memberDir = path.join(memberFilesDir, memberId);
    fs.mkdirSync(memberDir);

    // Save files
    const idFrontPath = await saveBase64File(formData.idFront, memberDir, "id_front");
    const idBackPath = await saveBase64File(formData.idBack, memberDir, "id_back");
    const signaturePath = await saveBase64File(formData.signature, memberDir, "signature");

    // Prepare DB payload
    const memberData: {
      firstName: string;
      lastName: string;
      email?: string;
      phoneNumber: string;
      membershipType: string;
      idFront: string;
      idBack: string;
      createdById: string;
      referredById?: string;
    } = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      membershipType: formData.membershipType,
      idFront: idFrontPath,
      idBack: idBackPath,
      createdById: session.user.id,
    };

    // Optional referrer
    if (formData.referrerId?.trim()) {
      const referrer = await prisma.member.findUnique({
        where: { id: formData.referrerId },
      });
      if (referrer) {
        memberData.referredById = formData.referrerId;
      } else {
        console.warn(`Referrer ID ${formData.referrerId} not found.`);
      }
    }

    // Save member
    const member = await prisma.member.create({ data: memberData });

    // Save additional data as JSON
    const additionalData = {
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      dateOfBirth: formData.dateOfBirth,
      termsAgreed: formData.termsAgreed,
      signaturePath: signaturePath,
    };

    fs.writeFileSync(
        path.join(memberDir, "member_details.json"),
        JSON.stringify(additionalData, null, 2)
    );

    return NextResponse.json({
      success: true,
      member: {
        id: member.id,
        firstName: member.firstName,
        lastName: member.lastName,
        membershipType: member.membershipType,
      },
    });
  } catch (error) {
    console.error("Error creating member:", error);
    return NextResponse.json({ error: "Failed to create member" }, { status: 500 });
  }
}

// Utility function
async function saveBase64File(
    base64Data: string,
    directory: string,
    fileName: string
): Promise<string> {
  try {
    const base64Match = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let fileExtension = ".jpg";
    let base64Content;

    if (base64Match) {
      const type = base64Match[1];
      if (type.includes("png")) fileExtension = ".png";
      else if (type.includes("jpeg") || type.includes("jpg")) fileExtension = ".jpg";
      base64Content = base64Match[2];
    } else {
      base64Content = base64Data;
    }

    const filePath = path.join(directory, `${fileName}${fileExtension}`);
    fs.writeFileSync(filePath, Buffer.from(base64Content, "base64"));
    return filePath;
  } catch (error) {
    console.error(`Failed to save file "${fileName}":`, error);
    throw error;
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
    const searchQuery = url.searchParams.get("search") || "";
    const statusFilter = url.searchParams.get("status");
    const membershipFilter = url.searchParams.get("membershipType");
    const appLinkedFilter = url.searchParams.get("appLinked");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const where: any = {};

    // Search by name, email, or phone
    if (searchQuery) {
      where.OR = [
        { firstName: { contains: searchQuery, mode: "insensitive" } },
        { lastName: { contains: searchQuery, mode: "insensitive" } },
        { email: { contains: searchQuery, mode: "insensitive" } },
        { phoneNumber: { contains: searchQuery, mode: "insensitive" } },
      ];
    }

    // Filter by status
    if (statusFilter) {
      if (statusFilter === "active") {
        where.isActive = true;
      } else if (statusFilter === "inactive") {
        where.isActive = false;
      }
    }

    // Filter by membership type
    if (membershipFilter) {
      where.membershipType = membershipFilter;
    }

    // Filter by app linked status
    if (appLinkedFilter) {
      if (appLinkedFilter === "linked") {
        where.appLinked = true;
      } else if (appLinkedFilter === "not-linked") {
        where.appLinked = false;
      }
    }

    // Get members with pagination
    const members = await prisma.member.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        referredBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Get total count for pagination
    const totalCount = await prisma.member.count({ where });

    return NextResponse.json({
      members,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching members:", error);
    return NextResponse.json(
        { error: "Failed to fetch members" },
        { status: 500 }
    );
  }
}