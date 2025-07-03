import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";

// GET: List tickets based on user role
export async function GET(req: NextRequest) {
  const { user, session } = await validateRequest();
  if (!user || !session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const tickets = await prisma.supportTicket.findMany({
      where: user.role === "ADMIN" 
        ? {} 
        : { creatorId: user.id },
      include: {
        messages: {
          include: { sender: true },
          orderBy: { createdAt: "asc" }
        },
        creator: true
      },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json({ tickets });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json(
      { error: "Failed to fetch tickets" },
      { status: 500 }
    );
  }
}

// POST: Reply to a ticket
export async function POST(req: NextRequest) {
  const { user, session } = await validateRequest();
  if (!user || !session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { ticketId, content } = await req.json();
    if (!ticketId || !content) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Verify the user has access to this ticket
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      select: { creatorId: true }
    });

    if (!ticket || (user.role !== "ADMIN" && ticket.creatorId !== user.id)) {
      return NextResponse.json({ error: "Not authorized to access this ticket" }, { status: 403 });
    }

    const message = await prisma.message.create({
      data: {
        ticketId,
        content,
        senderId: user.id
      }
    });

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Failed to create message" },
      { status: 500 }
    );
  }
}