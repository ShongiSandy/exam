export async function addMessage(ticketId: string, content: string, attachmentUrl?: string) {
    try {
      const response = await fetch(`/api/admin/support/add.message/${ticketId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, attachmentUrl }),
      });
  
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add message');
      }
  
      return await response.json();
    } catch (error) {
      console.error('Error adding message:', error);
      throw error;
    }
  }
  
  export async function getMessages(ticketId: string) {
    try {
      const response = await fetch(`/api/admin/support/add.message/${ticketId}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch messages');
      }
  
      return await response.json();
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }