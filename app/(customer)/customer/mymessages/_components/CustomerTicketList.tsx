"use client";
import React, { useState, useMemo } from "react";
import { format, formatDistanceToNowStrict } from "date-fns";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { TicketStatus } from "@prisma/client";
import type { TicketListItem } from "../page";
import { MessageSquare } from "lucide-react";

interface Props {
  tickets: TicketListItem[];
}

export default function CustomerTicketList({ tickets: initialTickets }: Props) {
  const [tickets] = useState<TicketListItem[]>(initialTickets);
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) =>
      ticket.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [tickets, search]);

  const totalPages = Math.ceil(filteredTickets.length / entriesPerPage);
  const paginatedTickets = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    return filteredTickets.slice(start, start + entriesPerPage);
  }, [filteredTickets, currentPage, entriesPerPage]);

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/50">
      <div className="p-6 border-b border-gray-700/50">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Support Tickets</h2>
            <p className="text-sm text-gray-400">
              {filteredTickets.length} {filteredTickets.length === 1 ? 'ticket' : 'tickets'} found
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Input
              placeholder="Search tickets..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="bg-gray-900/50 border-gray-700/50 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Select 
              value={String(entriesPerPage)} 
              onValueChange={(v) => { setEntriesPerPage(Number(v)); setCurrentPage(1); }}
            >
              <SelectTrigger className="w-full sm:w-40 bg-gray-900/50 border-gray-700/50 text-white">
                <SelectValue placeholder="Show entries" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700/50">
                {ENTRIES_OPTIONS.map((opt) => (
                  <SelectItem 
                    key={opt} 
                    value={String(opt)}
                    className="hover:bg-gray-700/50 text-white"
                  >
                    Show {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div className="p-1">
        {filteredTickets.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-gray-800/50 flex items-center justify-center mb-4">
              <MessageSquare className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-1">
              {search ? 'No matching tickets' : 'No support tickets yet'}
            </h3>
            <p className="text-gray-400 text-sm max-w-md mx-auto">
              {search 
                ? 'Try adjusting your search or filter to find what you\'re looking for.'
                : 'Submit a new support ticket to get started.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-700/50 hover:bg-transparent">
                  <TableHead className="text-gray-400 font-medium px-6 py-4">TICKET</TableHead>
                  <TableHead className="text-gray-400 font-medium px-6 py-4">STATUS</TableHead>
                  <TableHead className="text-gray-400 font-medium px-6 py-4 hidden md:table-cell">CREATED</TableHead>
                  <TableHead className="text-gray-400 font-medium px-6 py-4 hidden lg:table-cell">LAST UPDATE</TableHead>
                  <TableHead className="text-gray-400 font-medium px-6 py-4 text-center">MESSAGES</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-700/30">
                {paginatedTickets.map((ticket) => (
                  <TableRow 
                    key={ticket.id} 
                    className="border-b border-gray-700/30 hover:bg-gray-800/30 transition-colors"
                  >
                    <TableCell className="px-6 py-4">
                      <div className="font-medium text-white">{ticket.title}</div>
                      <div className="text-sm text-gray-400 md:hidden mt-1">
                        {format(new Date(ticket.createdAt), "MMM d, yyyy")}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <StatusBadge status={ticket.status as TicketStatus} />
                    </TableCell>
                    <TableCell className="px-6 py-4 hidden md:table-cell text-gray-300">
                      {format(new Date(ticket.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="px-6 py-4 hidden lg:table-cell text-gray-400">
                      {formatDistanceToNowStrict(new Date(ticket.updatedAt), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 text-sm font-medium">
                        {ticket._count.messages}
                      </span>
                    </TableCell>
                    <TableCell className="px-2 py-4 text-right">
                      <Link href={`/customer/mymessages/${ticket.id}`}>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-blue-400 border-blue-400/30 hover:bg-blue-500/10 hover:text-blue-300 transition-colors"
                        >
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
      
      {filteredTickets.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-700/30 bg-gray-900/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-400">
            Showing <span className="font-medium text-white">
              {Math.min((currentPage - 1) * entriesPerPage + 1, filteredTickets.length)}</span> to{' '}
            <span className="font-medium text-white">
              {Math.min(currentPage * entriesPerPage, filteredTickets.length)}</span> of{' '}
            <span className="font-medium text-white">{filteredTickets.length}</span> tickets
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="bg-gray-800/50 border-gray-700/50 text-gray-300 hover:bg-gray-700/50 hover:text-white disabled:opacity-50 disabled:pointer-events-none"
            >
              Previous
            </Button>
            <div className="px-3 py-1 text-sm text-gray-400">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="bg-gray-800/50 border-gray-700/50 text-gray-300 hover:bg-gray-700/50 hover:text-white disabled:opacity-50 disabled:pointer-events-none"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

const ENTRIES_OPTIONS = [5, 10, 20, 50];
