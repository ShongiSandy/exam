import { TicketStatus } from "@prisma/client";

export interface TicketWithDetails {
  id: string;
  title: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    username: string;
    email: string;
    avatarUrl?: string | null;
  };
  messages: Array<{
    id: string;
    content: string;
    createdAt: string;
    attachmentUrl?: string;
    sender: {
      id: string;
      username: string;
      email: string;
      avatarUrl?: string | null;
      role: string;
    };
  }>;
  _count: {
    messages: number;
  };
}