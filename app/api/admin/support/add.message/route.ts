import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Get messages for a ticket
export async function GET(
    req: Request,
    { params }: { params: { ticketId: string } }
  ) {
    try {
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        return NextResponse.json(
          { error: "Unauthorized access" },
          { status: 401 }
        );
      }
  
      const messages = await prisma.message.findMany({
        where: { ticketId: params.ticketId },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              email: true,
              avatarUrl: true, // Changed from image to avatarUrl
              role: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      });
  
      return NextResponse.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      return NextResponse.json(
        { error: "Failed to fetch messages" },
        { status: 500 }
      );
    }
  }
  
  // Add new message to ticket
  export async function POST(
    req: Request,
    { params }: { params: { ticketId: string } }
  ) {
    try {
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        return NextResponse.json(
          { error: "Unauthorized access" },
          { status: 401 }
        );
      }
  
      const body = await req.json();
      const { content, attachmentUrl } = body; // Changed from attachments to attachmentUrl
  
      const message = await prisma.message.create({
        data: {
          content,
          ticketId: params.ticketId,
          senderId: session.user.id,
          attachmentUrl, // Single attachmentUrl field
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              email: true,
              avatarUrl: true, // Changed from image to avatarUrl
              role: true,
            },
          },
        },
      });
  
      // Update ticket's updatedAt timestamp
      await prisma.supportTicket.update({
        where: { id: params.ticketId },
        data: { updatedAt: new Date() },
      });
  
      return NextResponse.json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      return NextResponse.json(
        { error: "Failed to create message" },
        { status: 500 }
      );
    }
  }