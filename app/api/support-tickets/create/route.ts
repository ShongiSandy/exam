import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { user, session } = await validateRequest();
  if (!user || !session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const title = formData.get("subject") as string;
    const message = formData.get("message") as string;
    const attachment = formData.get("attachment") as File | null;

    if (!title || !message) {
      return NextResponse.json(
        { error: "Subject and message are required" },
        { status: 400 }
      );
    }

    // Create the support ticket
    const ticket = await prisma.supportTicket.create({
      data: {
        title,
        name: user.username || "",
        email: user.email || "",
        message,
        status: "OPEN",
        creatorId: user.id,
        attachmentUrl: null, // We'll handle file upload separately if needed
      },
    });

    return NextResponse.json({ success: true, ticket });
  } catch (error) {
    console.error("Error creating support ticket:", error);
    return NextResponse.json(
      { error: "Failed to create support ticket" },
      { status: 500 }
    );
  }
}