'use client';

import React, { useState, useEffect } from 'react';
import { formatDate } from '@/lib/utils';
import { Shield, Clock, User, Info } from 'lucide-react';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/audit-logs')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.logs) setLogs(data.logs);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif font-bold text-2xl text-white">Security &amp; Operational Audit Trail</h1>
        <p className="text-xs text-charcoal-400 mt-1">
          Immutable system log of all administrative actions, stock adjustments, order updates, and payment verifications.
        </p>
      </div>

      <div className="bg-charcoal-950 rounded-3xl border border-charcoal-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-charcoal-900/60 text-[11px] uppercase tracking-wider text-charcoal-400 border-b border-charcoal-800">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Performed By</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-800 text-charcoal-300">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-charcoal-500">
                    No audit records logged yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  let detailsObj: any = null;
                  try {
                    detailsObj = typeof log.details === 'string' ? JSON.parse(log.details) : log.details;
                  } catch {}

                  return (
                    <tr key={log.id} className="hover:bg-charcoal-900/40">
                      <td className="py-3 px-4 font-mono text-[11px] text-charcoal-400">
                        {formatDate(log.created_at)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-charcoal-900 text-brand-300 border border-charcoal-800 font-mono">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-white">
                        {log.user_email || 'System / Webhook'}
                      </td>
                      <td className="py-3 px-4 text-charcoal-400">
                        <span className="capitalize">{log.target_type}</span>{' '}
                        {log.target_id && <span className="font-mono text-[10px] text-charcoal-500">({log.target_id.slice(0, 8)}...)</span>}
                      </td>
                      <td className="py-3 px-4 max-w-sm">
                        {detailsObj ? (
                          <pre className="text-[10px] font-mono text-charcoal-400 bg-charcoal-900/60 p-1.5 rounded-lg border border-charcoal-800 overflow-x-auto">
                            {JSON.stringify(detailsObj, null, 1).replace(/[\{\}\n]/g, ' ').trim()}
                          </pre>
                        ) : (
                          <span className="text-charcoal-500">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
