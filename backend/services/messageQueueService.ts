import { client } from "../config/db.ts";
import { Message } from "../deps.ts";

class MessageQueueService {
  // Add a new message to the queue
  async addMessage(payload: Record<string, unknown>): Promise<Message> {
    const result = await client.execute(
      `INSERT INTO message_queue (payload, status) VALUES (?, 'pending')`,
      [JSON.stringify(payload)],
    );
    
    const [message] = await client.query(
      "SELECT * FROM message_queue WHERE id = ?",
      [result.lastInsertId],
    );
    
    return {
      ...message,
      payload: JSON.parse(message.payload),
    };
  }

  // Get a message by ID
  async getMessage(id: string): Promise<Message | null> {
    const [message] = await client.query(
      "SELECT * FROM message_queue WHERE id = ?",
      [id],
    );
    
    if (!message) return null;
    
    return {
      ...message,
      payload: JSON.parse(message.payload),
    };
  }

  // Get messages with pagination and optional status filter
  async getMessages(
    page: number = 1,
    limit: number = 10,
    status?: string,
  ): Promise<{ messages: Message[]; total: number }> {
    const offset = (page - 1) * limit;
    let query = "SELECT * FROM message_queue";
    const params: any[] = [];
    
    if (status) {
      query += " WHERE status = ?";
      params.push(status);
    }
    
    // Add pagination
    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);
    
    const messages = await client.query(query, params);
    
    // Get total count
    let countQuery = "SELECT COUNT(*) as total FROM message_queue";
    if (status) {
      countQuery += " WHERE status = ?";
    }
    
    const [{ total }] = await client.query(countQuery, status ? [status] : []);
    
    return {
      messages: messages.map((msg: any) => ({
        ...msg,
        payload: JSON.parse(msg.payload),
      })),
      total: Number(total),
    };
  }

  // Update message status
  async updateStatus(id: string, status: Message["status"]): Promise<boolean> {
    const { affectedRows } = await client.execute(
      "UPDATE message_queue SET status = ? WHERE id = ?",
      [status, id],
    );
    
    return affectedRows > 0;
  }

  // Delete a message
  async deleteMessage(id: string): Promise<boolean> {
    const { affectedRows } = await client.execute(
      "DELETE FROM message_queue WHERE id = ?",
      [id],
    );
    
    return affectedRows > 0;
  }
}

export const messageQueueService = new MessageQueueService();
