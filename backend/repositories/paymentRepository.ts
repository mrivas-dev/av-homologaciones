import { getClient } from "../config/db.ts";
import {
  CreatePaymentRequest,
  Payment,
  PaymentGateway,
} from "../types/payment.types.ts";

export class PaymentRepository {
  async create(
    data: CreatePaymentRequest,
    userId: string,
  ): Promise<Payment> {
    const client = await getClient();
    const id = crypto.randomUUID();
    const now = new Date();

    await client.execute(
      `INSERT INTO payments (
        id, homologation_id, timestamp, amount, receipt_path, payment_gateway,
        created_at, created_by, is_deleted
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.homologationId,
        now,
        data.amount,
        null, // receipt_path - added later
        data.paymentGateway || PaymentGateway.MERCADOPAGO,
        now,
        userId,
        false,
      ],
    );

    return {
      id,
      homologationId: data.homologationId,
      timestamp: now,
      amount: data.amount,
      receiptPath: null,
      paymentGateway: data.paymentGateway || PaymentGateway.MERCADOPAGO,
      createdAt: now,
      createdBy: userId,
      isDeleted: false,
      deletedAt: null,
      deletedBy: null,
    };
  }

  async findById(id: string): Promise<Payment | null> {
    const client = await getClient();
    const result = await client.query(
      `SELECT * FROM payments WHERE id = ? AND is_deleted = false`,
      [id],
    );

    if (result.length === 0) {
      return null;
    }

    return this.mapRowToPayment(result[0]);
  }

  async findByHomologationId(homologationId: string): Promise<Payment[]> {
    const client = await getClient();
    const result = await client.query(
      `SELECT * FROM payments 
       WHERE homologation_id = ? AND is_deleted = false
       ORDER BY timestamp DESC`,
      [homologationId],
    );

    return result.map((row: any) => this.mapRowToPayment(row));
  }

  async hasPayment(homologationId: string): Promise<boolean> {
    const client = await getClient();
    const result = await client.query(
      `SELECT COUNT(*) as count FROM payments 
       WHERE homologation_id = ? AND is_deleted = false`,
      [homologationId],
    );

    return result[0].count > 0;
  }

  async getTotalPaid(homologationId: string): Promise<number> {
    const client = await getClient();
    const result = await client.query(
      `SELECT COALESCE(SUM(amount), 0) as total FROM payments 
       WHERE homologation_id = ? AND is_deleted = false`,
      [homologationId],
    );

    return Number(result[0].total);
  }

  async updateReceipt(
    id: string,
    receiptPath: string,
  ): Promise<Payment | null> {
    const client = await getClient();

    await client.execute(
      `UPDATE payments SET receipt_path = ? WHERE id = ? AND is_deleted = false`,
      [receiptPath, id],
    );

    return this.findById(id);
  }

  async softDelete(id: string, userId: string): Promise<boolean> {
    const client = await getClient();
    const now = new Date();

    const result = await client.execute(
      `UPDATE payments SET is_deleted = true, deleted_at = ?, deleted_by = ?
       WHERE id = ? AND is_deleted = false`,
      [now, userId, id],
    );

    return result.affectedRows !== undefined && result.affectedRows > 0;
  }

  private mapRowToPayment(row: any): Payment {
    return {
      id: row.id,
      homologationId: row.homologation_id,
      timestamp: row.timestamp,
      amount: row.amount,
      receiptPath: row.receipt_path,
      paymentGateway: row.payment_gateway,
      createdAt: row.created_at,
      createdBy: row.created_by,
      isDeleted: Boolean(row.is_deleted),
      deletedAt: row.deleted_at,
      deletedBy: row.deleted_by,
    };
  }
}

