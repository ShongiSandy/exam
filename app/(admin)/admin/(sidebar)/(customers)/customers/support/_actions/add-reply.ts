// app/(admin)/admin/(sidebar)/(customers)/customers/support/_actions/add-reply.ts

"use server";

import { validateRequest } from "@/auth"; // Adjust path
import prisma from "@/lib/prisma"; // Adjust path
import { Prisma, TicketStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Validation schema for the reply input
const addReplySchema = z.object({
  ticketId: z.string().cuid(), // Or uuid() depending on your ID type
  content: z.string().min(1, "Reply message cannot be empty.").max(5000), // Add max length
});

// Response type
export type AddReplyResponse = {
  success: boolean;
  message: string;
};

export async function addReply(
  ticketId: string,
  content: string,
): Promise<AddReplyResponse> {
  // 1. Authenticate admin user
  const { user } = await validateRequest();
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN")) {
    return { success: false, message: "Unauthorized." };
  }

  // 2. Validate input
  const validation = addReplySchema.safeParse({ ticketId, content });
  if (!validation.success) {
    return { success: false, message: "Invalid input." };
  }

  const { ticketId: validTicketId, content: validContent } = validation.data;

  try {
    // 3. Create the new message and update the ticket in a transaction
    const [, updatedTicket] = await prisma.$transaction([
      prisma.message.create({
        data: {
          content: validContent,
          ticketId: validTicketId,
          senderId: user.id, // The logged-in admin is the sender
        },
      }),
      prisma.supportTicket.update({
        where: { id: validTicketId },
        data: {
          status: TicketStatus.IN_PROGRESS, // Example: Auto-set to In Progress on reply
          updatedAt: new Date(), // Manually update timestamp if not using @updatedAt
        },
      }),
    ]);


    revalidatePath(`/admin/customers/support/${validTicketId}`);
    revalidatePath(`/admin/customers/support`);

    return { success: true, message: "Reply sent." };
  } catch (error) {
    console.error("Error adding reply:", error);
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {

      return { success: false, message: "Ticket not found." };
    }
    return { success: false, message: "Database error sending reply." };
  }
}
