// BELENTANI OMEGA ULTRA
// Autoría: Pedro Belentani
// Fecha: 2026-08-14
'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Info, AlertTriangle, CheckCircle, Clock, CheckCheck, ChevronRight } from 'lucide-react';
import { usePortalStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// ============ TYPES ============
interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'reminder';
  title: string;
  content: string;
  read: boolean;
  createdAt: string;
}

// ============ HELPERS ============
const typeConfig: Record<Notification['type'], { icon: React.ElementType; color: string; bg: string }> = {
  info: { icon: Info, color: 'text-sky-600', bg: 'bg-sky-100' },
  warning: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-100' },
  success: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  reminder: { icon: Clock, color: 'text-violet-600', bg: 'bg-violet-100' },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'ahora';
  if (mins < 60) return `hace ${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `hace ${days}d`;
}

// ============ API ============
async function fetchNotifications(token: string): Promise<{ notifications: Notification[]; unreadCount: number }> {
  const res = await fetch('/api/notifications?unreadOnly=true', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return { notifications: [], unreadCount: 0 };
  return res.json();
}

async function markAllRead(token: string, ids: string[]): Promise<void> {
  await fetch('/api/notifications', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ids }),
  });
}

// ============ HOOK ============
function useClickOutside(ref: React.RefObject<HTMLElement | null>, handler: () => void) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) return;
      handler();
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

// ============ COMPONENT ============
export function NotificationBell() {
  const token = usePortalStore((s) => s.token);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const loadNotifications = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await fetchNotifications(token);
      setNotifications(data.notifications);
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useClickOutside(dropdownRef, () => setOpen(false));

  const handleMarkAllRead = async () => {
    if (!token || markingAll) return;
    setMarkingAll(true);
    try {
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
      if (unreadIds.length > 0) {
        await markAllRead(token, unreadIds);
      }
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // Silently fail
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <Button
        variant="ghost"
        size="icon"
        className="relative text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Notificaciones"
      >
        <motion.div
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <Bell className="w-5 h-5" />
        </motion.div>

        {/* Unread Badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-emerald-600 text-white text-[10px] font-bold rounded-full"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </Button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute right-0 top-full mt-2 w-[360px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl shadow-black/10 border border-slate-200/80 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50/80 border-b border-slate-200/60">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-semibold text-slate-900">Notificaciones</h3>
                {unreadCount > 0 && (
                  <span className="text-[11px] font-medium text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                    {unreadCount} nueva{unreadCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  disabled={markingAll}
                  className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors disabled:opacity-50"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  {markingAll ? 'Marcando...' : 'Marcar todas'}
                </button>
              )}
            </div>

            {/* Notification List */}
            <ScrollArea className="max-h-96">
              {loading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3 animate-pulse">
                      <div className="w-8 h-8 rounded-lg bg-slate-200 shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3.5 bg-slate-200 rounded w-3/4" />
                        <div className="h-3 bg-slate-100 rounded w-full" />
                        <div className="h-2.5 bg-slate-100 rounded w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
                    <Bell className="w-5 h-5 text-emerald-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-600">Sin notificaciones</p>
                  <p className="text-xs text-slate-400 mt-1">Estás al día con todo</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {notifications.map((notification, index) => {
                    const cfg = typeConfig[notification.type];
                    const Icon = cfg.icon;

                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.04 }}
                        className={cn(
                          'flex gap-3 px-4 py-3 transition-colors hover:bg-slate-50 cursor-pointer',
                          !notification.read && 'bg-emerald-50/60'
                        )}
                      >
                        {/* Icon */}
                        <div
                          className={cn(
                            'flex items-center justify-center w-8 h-8 rounded-lg shrink-0 mt-0.5',
                            cfg.bg
                          )}
                        >
                          <Icon className={cn('w-4 h-4', cfg.color)} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p
                              className={cn(
                                'text-sm leading-snug',
                                !notification.read ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'
                              )}
                            >
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                            {notification.content}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-1">
                            {timeAgo(notification.createdAt)}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>

            {/* Footer */}
            <Separator />
            <div className="px-4 py-2.5">
              <button
                className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors w-full justify-center py-1 rounded-lg hover:bg-emerald-50"
                onClick={() => setOpen(false)}
              >
                Ver todas
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
