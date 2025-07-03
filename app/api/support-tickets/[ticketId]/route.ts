import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { ticketId: string } }) {
  const { user, session } = await validateRequest();
  if (!user || !session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const ticket = await prisma.supportTicket.findUnique({
      where: { 
        id: params.ticketId,
        ...(user.role !== "ADMIN" ? { creatorId: user.id } : {})
      },
      include: {
        messages: {
          include: { sender: true },
          orderBy: { createdAt: "asc" }
        },
        creator: true
      }
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json({ ticket });
  } catch (error) {
    console.error("Error fetching ticket:", error);
    return NextResponse.json(
      { error: "Failed to fetch ticket" },
      { status: 500 }
    );
  }
}