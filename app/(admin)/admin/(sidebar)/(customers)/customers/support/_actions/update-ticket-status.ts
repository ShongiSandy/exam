import { TicketStatus } from "@prisma/client";

export async function updateTicketStatus(ticketId: string, status: TicketStatus) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(new URL(`/api/admin/support/update.ticket/${ticketId}`, baseUrl), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update ticket status');
    }

    return { success: true, message: 'Status updated successfully' };
  } catch (error) {
    console.error('Error updating ticket status:', error);
    return { success: false, message: 'Failed to update ticket status' };
  }
}