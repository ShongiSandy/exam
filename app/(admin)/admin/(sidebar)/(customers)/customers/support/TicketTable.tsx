"use client";

import React, { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { TicketStatus } from "@prisma/client";
import { format, formatDistanceToNowStrict } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  MoreHorizontal,
  MessageSquareReply,
  CheckCircle,
  LoaderCircle,
  XCircle,
  Search,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TicketWithDetails } from "./_actions/types";

interface TicketTableProps {
  tickets: TicketWithDetails[];
}

export const TicketTable: React.FC<TicketTableProps> = ({ tickets }) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [isPending, startTransition] = useTransition();
  const [updatingTicketId, setUpdatingTicketId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const handleRowClick = (ticketId: string) => {
    router.push(`/admin/customers/support/${ticketId}`);
  };

  // Memoized filtering logic
  const filteredTickets = useMemo(() => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    if (!Array.isArray(tickets)) return [];
    if (!lowerSearchTerm) return tickets;
    return tickets.filter(
      (ticket) =>
        (ticket?.title?.toLowerCase() ?? "").includes(lowerSearchTerm) ||
        (ticket?.creator?.username?.toLowerCase() ?? "").includes(lowerSearchTerm) ||
        (ticket?.creator?.email?.toLowerCase() ?? "").includes(lowerSearchTerm) ||
        (ticket?.id?.toLowerCase() ?? "").includes(lowerSearchTerm) ||
        (ticket?.status?.toLowerCase().replace("_", " ") ?? "").includes(lowerSearchTerm)
    );
  }, [tickets, searchTerm]);

  // Pagination logic
  const paginatedTickets = useMemo(() => {
    const startIndex = (currentPage - 1) * entriesPerPage;
    return filteredTickets.slice(startIndex, startIndex + entriesPerPage);
  }, [filteredTickets, currentPage, entriesPerPage]);

  const totalPages = Math.ceil(filteredTickets.length / entriesPerPage);

  const handleStatusUpdate = async (ticketId: string, newStatus: TicketStatus) => {
    try {
      setUpdatingTicketId(ticketId);
      const response = await fetch(`/api/admin/support/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update status');
      
      toast.success('Ticket status updated successfully');
      router.refresh();
    } catch (error) {
      toast.error('Failed to update ticket status');
    } finally {
      setUpdatingTicketId(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/80 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/50 shadow-xl"
    >
      <div className="p-6 border-b border-gray-700/50">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <motion.div 
            className="flex-1 w-full md:w-auto"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <label
              htmlFor="entries-select"
              className="text-sm text-gray-400 whitespace-nowrap"
            >
              Show entries
            </label>
            <select
              id="entries-select"
              name="entries"
              value={entriesPerPage}
              onChange={(e) => setEntriesPerPage(Number(e.target.value))}
              className="rounded-lg border border-gray-600/50 bg-gray-700/50 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Number of entries per page"
            >
              {[5, 10, 20, 50].map((value) => (
                <option key={value} value={value}>{value} entries</option>
              ))}
            </select>
          </motion.div>

          <motion.div 
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="search"
                id="ticket-search"
                name="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by ticket ID, title, or customer..."
                className="pl-10 w-full bg-gray-700/50 border-gray-600/50 text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Search tickets"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="bg-gray-700/50 border-gray-600/50 text-gray-200 hover:bg-gray-700/70 hover:border-gray-500/50 transition-colors"
              aria-label="Toggle filters"
              aria-expanded={showFilters}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </motion.div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 pt-4 border-t border-gray-700/50"
            >
              {/* Add your filter controls here */}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-700/50 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              <th className="px-6 py-4 font-medium">TICKET</th>
              <th className="px-6 py-4 font-medium">CUSTOMER</th>
              <th className="px-6 py-4 font-medium hidden md:table-cell">STATUS</th>
              <th className="px-6 py-4 font-medium hidden lg:table-cell">LAST UPDATED</th>
              <th className="px-6 py-4 font-medium text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/30">
            {paginatedTickets.map((ticket) => (
              <motion.tr
                key={ticket.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`group hover:bg-gray-700/30 transition-colors ${
                  isPending ? 'opacity-70' : ''
                }`}
                onClick={() => handleRowClick(ticket.id)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  {ticket.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                  {ticket.title}
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                  <div className="inline-flex items-center">
                    <StatusBadge status={ticket.status} />
                    {ticket._count.messages > 0 && (
                      <span className="ml-2 text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full">
                        {ticket._count.messages} {ticket._count.messages === 1 ? 'message' : 'messages'}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 hidden lg:table-cell">
                  <div className="text-sm text-white">
                    {formatDistanceToNowStrict(new Date(ticket.updatedAt), {
                      addSuffix: true,
                    })}
                  </div>
                  <div className="text-xs text-gray-400">
                    Created: {format(new Date(ticket.createdAt), 'MMM d, yyyy')}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700/50"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/admin/customers/support/${ticket.id}`);
                        }}
                      >
                        <MessageSquareReply className="h-4 w-4 mr-2" />
                        Reply
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusUpdate(ticket.id, TicketStatus.OPEN);
                        }}
                        disabled={ticket.status === TicketStatus.OPEN || updatingTicketId === ticket.id}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Set as Open
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusUpdate(ticket.id, TicketStatus.IN_PROGRESS);
                        }}
                        disabled={ticket.status === TicketStatus.IN_PROGRESS || updatingTicketId === ticket.id}
                      >
                        <LoaderCircle className="h-4 w-4 mr-2" />
                        Set In Progress
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusUpdate(ticket.id, TicketStatus.RESOLVED);
                        }}
                        disabled={ticket.status === TicketStatus.RESOLVED || updatingTicketId === ticket.id}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Resolved
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-sm text-red-400 hover:bg-red-900/20 px-3 py-2.5 cursor-pointer rounded-md focus:bg-red-900/20 focus:text-red-300"
                        onClick={async (e) => {
                          e.stopPropagation();
                          await handleStatusUpdate(ticket.id, TicketStatus.CLOSED);
                        }}
                        disabled={isPending && updatingTicketId === ticket.id}
                      >
                        {isPending && updatingTicketId === ticket.id ? (
                          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <XCircle className="mr-2 h-4 w-4" />
                        )}
                        <span>Close Ticket</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <motion.div
        className="px-6 py-4 border-t border-gray-700/30 bg-gray-800/30 flex flex-col sm:flex-row items-center justify-between gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
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
            Page <span className="font-medium text-white">{currentPage}</span> of <span className="font-medium text-white">{totalPages}</span>
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
      </motion.div>
    </motion.div>
  );
};