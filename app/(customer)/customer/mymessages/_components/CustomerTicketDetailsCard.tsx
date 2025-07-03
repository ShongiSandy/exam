"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TicketStatus } from "@prisma/client";

interface TicketDetails {
  id: string;
  title: string;  // Changed from subject to title
  status: string;
  createdAt: string;
  updatedAt: string;
  initialMessage: string;
  attachmentUrl?: string;
}

interface Props {
  ticketId: string;
}

export default function CustomerTicketDetailsCard({ ticketId }: Props) {
  const [ticket, setTicket] = useState<TicketDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/support-tickets/${ticketId}`)
      .then((res) => res.json())
      .then((data) => {
        setTicket(data.ticket || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [ticketId]);

  if (loading) return <Card><CardContent>Loading ticket details...</CardContent></Card>;
  if (!ticket) return <Card><CardContent>Ticket not found.</CardContent></Card>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{ticket.title}</CardTitle>
        <div className="flex items-center gap-2 mt-2">
          <StatusBadge status={ticket.status as TicketStatus} />
          <span className="text-xs text-muted-foreground">Created: {format(new Date(ticket.createdAt), "MMM d, yyyy HH:mm")}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-2">
          <strong>Initial Message:</strong>
          <div className="mt-1 whitespace-pre-line">{ticket.initialMessage}</div>
        </div>
        {ticket.attachmentUrl && (
          <div className="mb-2">
            <Link href={ticket.attachmentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
              View Attachment
            </Link>
          </div>
        )}
        <div className="text-xs text-muted-foreground mt-4">
          Last updated: {format(new Date(ticket.updatedAt), "MMM d, yyyy HH:mm")}
        </div>
      </CardContent>
    </Card>
  );
}