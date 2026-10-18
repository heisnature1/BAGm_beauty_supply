import { getDb } from './db';
import crypto from 'crypto';

export function recordAuditLog({
  userId,
  userEmail,
  action,
  targetType,
  targetId,
  details,
  ipAddress,
}: {
  userId?: string | null;
  userEmail?: string | null;
  action: string;
  targetType: string;
  targetId?: string | null;
  details?: Record<string, any>;
  ipAddress?: string | null;
}) {
  try {
    const db = getDb();
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO audit_logs (id, user_id, user_email, action, target_type, target_id, details, ip_address, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      userId || null,
      userEmail || null,
      action,
      targetType,
      targetId || null,
      details ? JSON.stringify(details) : null,
      ipAddress || null,
      createdAt
    );
  } catch (error) {
    console.error('Failed to record audit log:', error);
  }
}
