import React from "react";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { validateRequest } from "@/auth";
import { Prisma, TicketStatus } from "@prisma/client";
import CustomerTicketList from "./_components/CustomerTicketList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import AnimatedCard from "./_components/AnimatedCard";

const _myTicketListItemPayload =
  Prisma.validator<Prisma.SupportTicketDefaultArgs>()({
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
      title: true,
      status: true,
      messages: {
        select: { createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      _count: {
        select: { messages: true },
      },
    },
  });

export type TicketListItem = Prisma.SupportTicketGetPayload<
  typeof _myTicketListItemPayload
>;

type GetMyTicketsResult = TicketListItem[];

const myTicketQueryArgs = (userId: string) =>
  ({
    where: { creatorId: userId },
    select: _myTicketListItemPayload.select,
    orderBy: { createdAt: "desc" as const },
  }) satisfies Prisma.SupportTicketFindManyArgs;

async function getMyTickets(userId: string): Promise<GetMyTicketsResult> {
  try {
    const args = myTicketQueryArgs(userId);
    const tickets = await prisma.supportTicket.findMany(args);
    return tickets ?? [];
  } catch (error) {
    console.error("Failed to fetch user's tickets:", error);
    return [];
  }
}

export default async function MyMessagesPage() {
  const { user } = await validateRequest();
  if (!user) {
    redirect("/login");
  }

  const myTickets = await getMyTickets(user.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <AnimatedCard>
          <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 shadow-2xl rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700/50 p-8">
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                  <MessageSquare className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
                  My Support Tickets
                </CardTitle>
                <p className="text-gray-400 text-sm font-medium">
                  View and manage your support requests
                </p>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-6 bg-gray-900/30">
                <CustomerTicketList tickets={myTickets} />
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>
    </div>
  );
}
