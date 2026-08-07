import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import apiClient from '../api/apiClient';

const AuditLogContext = createContext(null);

export function AuditLogProvider({ children }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await apiClient.get('/audit-logs');
      if (res.data && res.data.success) {
        setLogs(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch audit logs', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  /**
   * Add a new audit-log entry.
   * @param {object} params
   */
  const addLog = useCallback(async (params) => {
    try {
      const res = await apiClient.post('/audit-logs', params);
      if (res.data && res.data.success) {
        setLogs((prev) => [res.data.data, ...prev]);
        return res.data.data;
      }
    } catch (error) {
      console.error('Failed to add audit log', error);
    }
    return null;
  }, []);

  /** Clear all logs (admin action) */
  const clearLogs = useCallback(() => {
    // For now, no clear logs API is implemented on the backend as audit logs should generally be immutable
    // We can just clear local state if really needed, or do nothing.
    console.warn('Clear logs not supported for DB-backed audit logs');
  }, []);

  return (
    <AuditLogContext.Provider value={{ logs, loading, addLog, clearLogs, fetchLogs }}>
      {children}
    </AuditLogContext.Provider>
  );
}

/** Hook to consume audit log context inside components */
export function useAuditLog() {
  const ctx = useContext(AuditLogContext);
  if (!ctx) {
    throw new Error('useAuditLog must be used inside <AuditLogProvider>');
  }
  return ctx;
}

// ─── Standalone helper (for use outside React components) ────────────────────

/**
 * Log an audit event directly to the API (no React context needed).
 * Call this from any page after a Create / Edit / Delete operation.
 */
export async function logAuditEvent(params) {
  try {
    const res = await apiClient.post('/audit-logs', params);
    if (res.data && res.data.success) {
      return res.data.data;
    }
  } catch (error) {
    console.error('Failed to standalone log audit event', error);
  }
  return null;
}
