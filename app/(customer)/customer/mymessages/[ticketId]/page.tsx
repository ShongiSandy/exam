"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { format } from "date-fns";
import { TicketStatus } from "@prisma/client";
import { MessageCircle, Paperclip, Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TicketDetails {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  message: string;
  attachmentUrl?: string;
  messages: MessageDetails[];
}

interface MessageDetails {
  id: string;
  content: string;
  senderName: string;
  createdAt: string;
  attachmentUrl?: string;
}

export default function TicketDetailPage() {
  const router = useRouter();
  const params = useParams();
  const ticketId = params?.ticketId as string;
  const [ticket, setTicket] = useState<TicketDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ticketId) return;
    setLoading(true);
    fetch(`/api/support-tickets/${ticketId}`)
      .then((res) => res.json())
      .then((data) => {
        setTicket(data.ticket || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [ticketId]);

  if (loading) return (
    <Card className="animate-pulse">
      <CardContent className="p-8 text-center text-muted-foreground">
        Loading ticket details...
      </CardContent>
    </Card>
  );

  if (!ticket) return (
    <Card className="border-destructive">
      <CardContent className="p-8 text-center text-destructive">
        Ticket not found.
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back Button */}
      <Button
        onClick={() => router.push("/customer/mymessages")}
        variant="ghost"
        className="text-[#e87a64] hover:text-[#e87a64]/80 hover:bg-[#e87a64]/10 dark:text-white dark:hover:text-white/80 dark:hover:bg-[#132541]/10"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Messages
      </Button>

      {/* Ticket Details Card */}
      <Card className="bg-[#e87a64]/10 dark:bg-[#132541]/10 border-[#e87a64]/20 dark:border-[#132541]/20 shadow-lg">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-[#e87a64] dark:text-white">
              {ticket.title}
            </CardTitle>
            <StatusBadge status={ticket.status as TicketStatus} />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span suppressHydrationWarning>
              Created {format(new Date(ticket.createdAt), "PPP 'at' pp")}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-[#e87a64]/5 dark:bg-[#132541]/5 rounded-lg p-4">
            <div className="font-medium text-[#e87a64] dark:text-white mb-2 flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Initial Message
            </div>
            <div className="text-foreground/90 whitespace-pre-line">
              {ticket.message}
            </div>
            {ticket.attachmentUrl && (
              <div className="mt-4 flex items-center gap-2 text-[#e87a64] hover:text-[#e87a64]/80 dark:text-white dark:hover:text-white/80">
                <Paperclip className="h-4 w-4" />
                <a
                  href={ticket.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4"
                >
                  View Attachment
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Messages */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-[#e87a64] dark:text-white">Conversation History</h2>
        {ticket.messages?.map((message) => (
          <Card key={message.id} className="bg-[#e87a64]/5 dark:bg-[#132541]/5 border-[#e87a64]/10 dark:border-[#132541]/10 shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="font-medium text-[#e87a64] dark:text-white">
                  {message.senderName}
                </div>
                <div className="text-sm text-muted-foreground" suppressHydrationWarning>
                  {format(new Date(message.createdAt), "PP 'at' p")}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-foreground/90 whitespace-pre-line">
                {message.content}
              </div>
              {message.attachmentUrl && (
                <div className="mt-3 flex items-center gap-2 text-[#e87a64] hover:text-[#e87a64]/80 dark:text-white dark:hover:text-white/80">
                  <Paperclip className="h-4 w-4" />
                  <a
                    href={message.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-4"
                  >
                    View Attachment
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}