// BELENTANI OMEGA ULTRA
// Autoría: Pedro Belentani
// Fecha: 2026-08-14
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { usePortalStore } from '@/lib/store';
import { io } from 'socket.io-client';
import { format } from 'date-fns';
import type { Socket } from 'socket.io-client';
import type { Message } from '@/lib/store';

interface MessageThreadProps {
  recipientId: string;
  recipientName: string;
  projectId?: string;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatTime(dateStr: string): string {
  try {
    return format(new Date(dateStr), 'MMM d, h:mm a');
  } catch {
    return dateStr;
  }
}

export function MessageThread({ recipientId, recipientName, projectId }: MessageThreadProps) {
  const { user, token, socket: storeSocket } = usePortalStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const currentUserId = user?.id ?? '';

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    try {
      const params = new URLSearchParams({ otherUserId: recipientId });
      if (projectId) params.set('projectId', projectId);
      const res = await fetch(`/api/messages?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoading(false);
    }
  }, [recipientId, projectId, token]);

  // Mark messages as read
  const markAsRead = useCallback(async () => {
    try {
      await fetch(`/api/messages?markRead=true&otherUserId=${recipientId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // silently fail
    }
  }, [recipientId, token]);

  useEffect(() => {
    fetchMessages();
    markAsRead();
  }, [fetchMessages, markAsRead]);

  // Socket connection for real-time messages
  useEffect(() => {
    if (storeSocket) {
      socketRef.current = storeSocket;
      return;
    }

    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      `${window.location.protocol}//${window.location.hostname}:3004`;
    const socket = io(socketUrl);
    socket.on('connect', () => {
      if (currentUserId) {
        socket.emit('register', currentUserId);
      }
    });
    socket.on('new-message', (message: Message) => {
      if (
        (message.senderId === recipientId && message.recipientId === currentUserId) ||
        (message.senderId === currentUserId && message.recipientId === recipientId)
      ) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
      }
    });
    socketRef.current = socket;

    return () => {
      if (!storeSocket) {
        socket.disconnect();
      }
    };
  }, [recipientId, currentUserId, storeSocket]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    const trimmed = newMessage.trim();
    if (!trimmed || sending) return;

    setSending(true);
    try {
      const body: Record<string, string> = {
        recipientId,
        content: trimmed,
      };
      if (projectId) body.projectId = projectId;

      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const message = await res.json();
        setMessages((prev) => [...prev, message]);
        setNewMessage('');
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isOwn = (msg: Message) => msg.senderId === currentUserId;

  return (
    <div className="flex flex-col h-full w-full bg-white rounded-2xl border border-slate-100 shadow-lg shadow-black/5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50/50">
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm font-semibold">
            {getInitials(recipientName)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-semibold text-slate-800">{recipientName}</p>
          <p className="text-xs text-slate-400">Direct message</p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-1" style={{ maxHeight: 'calc(100vh - 340px)' }}>
        {loading ? (
          <div className="space-y-4 p-2">
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-16 w-64 rounded-2xl" />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <div className="space-y-2">
                <Skeleton className="h-3 w-16 ml-auto" />
                <Skeleton className="h-20 w-56 rounded-2xl" />
              </div>
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full min-h-[200px]">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                </svg>
              </div>
              <p className="text-sm text-slate-400 font-medium">No messages yet</p>
              <p className="text-xs text-slate-300 mt-1">Start the conversation</p>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {messages.map((msg) => {
              const own = isOwn(msg);
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className={cn(
                    'flex gap-2 max-w-[80%]',
                    own ? 'ml-auto flex-row-reverse' : 'mr-auto'
                  )}
                >
                  <Avatar className="h-7 w-7 shrink-0 mt-1">
                    <AvatarFallback
                      className={cn(
                        'text-[10px] font-semibold',
                        own
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-600'
                      )}
                    >
                      {getInitials(msg.sender?.fullName ?? 'U')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span
                      className={cn(
                        'text-[10px] text-slate-400 mb-0.5 px-1',
                        own ? 'text-right' : 'text-left'
                      )}
                    >
                      {own ? 'You' : (msg.sender?.fullName ?? '')} · {formatTime(msg.createdAt)}
                    </span>
                    <div
                      className={cn(
                        'rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                        own
                          ? 'bg-emerald-600 text-white rounded-tr-md'
                          : 'bg-slate-100 text-slate-800 rounded-tl-md'
                      )}
                    >
                      {msg.content}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-slate-100 p-4 bg-slate-50/30">
        <div className="flex items-center gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${recipientName}...`}
            className="flex-1 rounded-xl border-slate-200 bg-white h-11 px-4 text-sm focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500"
            disabled={sending}
          />
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            size="icon"
            className="h-11 w-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 shadow-md shadow-emerald-600/20 transition-all hover:shadow-lg hover:shadow-emerald-600/30 disabled:opacity-40 disabled:shadow-none"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
