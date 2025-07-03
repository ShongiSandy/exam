// app/(admin)/admin/(sidebar)/(customers)/customers/support/[ticketId]/page.tsx

import React from "react";
import prisma from "@/lib/prisma"; // Adjust path if needed
import { notFound, redirect } from "next/navigation";
import { validateRequest } from "@/auth"; // Adjust path if needed
import { Prisma, TicketStatus, UserRole } from "@prisma/client"; // Import UserRole

// Import components
import TicketDetailsCard from "@/app/(admin)/admin/(sidebar)/(customers)/customers/support/TicketDetailsCard"; // Adjust path
import MessageThread from "@/components/shared/MessageThread"; // Adjust path
import ReplyForm from "@/app/(admin)/admin/(sidebar)/(customers)/customers/support/ReplyForm"; // Adjust path

export type FullTicketDetails = Prisma.SupportTicketGetPayload<{
  include: {
    creator: {
      select: { id: true; username: true; email: true; role: true }; // Specify included User fields
    };
    messages: {
      include: {
        sender: { select: { id: true; username: true; role: true } }; // Specify included Sender fields for each message
      };
      orderBy: { createdAt: "asc" }; // Include orderBy if it affects the type (usually doesn't, but good practice)
    };
  };
}>;

async function getTicketDetails(
  ticketId: string,
): Promise<FullTicketDetails | null> {
  if (!ticketId || typeof ticketId !== "string" || ticketId.length < 5) {
    console.error("Invalid ticketId provided:", ticketId);
    return null;
  }
  try {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        creator: {
          select: { id: true, username: true, email: true, role: true },
        }, // Role included
        messages: {
          include: {
            sender: { select: { id: true, username: true, role: true } },
          }, // Role included
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!ticket) {
      console.log(`Ticket with ID ${ticketId} not found in database.`);
      return null;
    }

    return ticket;
  } catch (error) {
    console.error(`Error fetching ticket details for ID ${ticketId}:`, error);
    return null;
  }
}


export default async function TicketDetailPage({
  params,
}: {
  params: { ticketId: string };
}) {
  const { ticketId } = params;

  const { user: adminUser } = await validateRequest();

  const allowedRoles: UserRole[] = [UserRole.ADMIN, UserRole.SUPERADMIN];

  if (!adminUser || !allowedRoles.includes(adminUser.role)) {
    console.log(
      `Redirecting user with role ${adminUser?.role ?? "None"} from ticket detail page.`,
    );
    redirect("/login"); 
  }

  const ticket = await getTicketDetails(ticketId);


  if (!ticket) {
    notFound();
  }
  const initialMessageForThread = {
    content: ticket.message, 
    createdAt: ticket.createdAt, 
    sender: ticket.creator, 
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* The components expect 'ticket' to match 'FullTicketDetails' */}
      <TicketDetailsCard ticket={ticket} />
      <MessageThread
        initialMessage={initialMessageForThread}
        messages={ticket.messages} 
        currentUserId={adminUser.id} 
      />
      <ReplyForm ticketId={ticket.id} />
    </div>
  );
}
