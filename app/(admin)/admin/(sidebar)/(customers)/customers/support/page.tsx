import React from "react";
import { headers } from 'next/headers';
import { TicketTable } from "./TicketTable";
import prisma from "@/lib/prisma";
import { Prisma } from '@prisma/client';
import { Metadata } from "next";
import { TicketWithDetails } from "./_actions/types";

export const metadata: Metadata = {
  title: "Admin Support - Tickets",
  description: "Manage customer support tickets",
};

type TicketWithIncludes = Prisma.SupportTicketGetPayload<{
  include: {
    creator: {
      select: {
        id: true;
        username: true;
        email: true;
        avatarUrl: true;
        role: true;
      };
    };
    messages: {
      include: {
        sender: {
          select: {
            id: true;
            username: true;
            email: true;
            avatarUrl: true;
            role: true;
          };
        };
      };
    };
    _count: {
      select: { messages: true };
    };
  };
}>;

type MessageWithIncludes = TicketWithIncludes['messages'][number];

async function getTickets() {
  try {
    const tickets = await prisma.supportTicket.findMany({
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
            avatarUrl: true,
            role: true,
          },
        },
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                email: true,
                avatarUrl: true,
                role: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { messages: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return tickets.map((ticket: TicketWithIncludes) => ({
      ...ticket,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
      creator: {
        ...ticket.creator,
        avatarUrl: ticket.creator.avatarUrl ?? null
      },
      messages: ticket.messages.map((message: MessageWithIncludes) => ({
        ...message,
        createdAt: message.createdAt.toISOString(),
        sender: {
          ...message.sender,
          avatarUrl: message.sender.avatarUrl ?? null
        }
      }))
    })) as unknown as TicketWithDetails[];
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return [];
  }
}

// Make sure to declare this as a React Server Component
const Page = async () => {
  const tickets = await getTickets();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300">
                Support Tickets
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Manage and respond to customer support requests
              </p>
            </div>
          </div>
          
          <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent my-6"></div>
        </div>
        
        {tickets.length === 0 ? (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-12 text-center border border-gray-700/50 shadow-xl">
            <div className="mx-auto w-20 h-20 rounded-full bg-gray-800/70 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No support tickets yet</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              When customers reach out for support, their messages will appear here.
            </p>
          </div>
        ) : (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/50 shadow-xl">
            <TicketTable tickets={tickets} />
          </div>
        )}
      </div>
    </div>
  );
};

// Make sure to export the component as default
export default Page;