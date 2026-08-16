// BELENTANI OMEGA ULTRA
// Autoría: Pedro Belentani
// Fecha: 2026-08-14
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FolderKanban,
  Receipt,
  MessageSquare,
  Users,
  ClipboardCheck,
  LogOut,
  Sparkles,
  Menu,
  X,
  ChevronLeft,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { usePortalStore, type AdminView, type ClientView } from '@/lib/store';

interface SidebarProps {
  type: 'client' | 'admin';
  onNavigate: (view: string) => void;
  activeView: string;
  unreadCount?: number;
}

interface NavItem {
  view: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function Sidebar({ type, onNavigate, activeView, unreadCount = 0 }: SidebarProps) {
  const { user, logout } = usePortalStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const clientLinks: NavItem[] = [
    { view: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { view: 'projects', label: 'Proyectos', icon: <FolderKanban className="h-5 w-5" /> },
    { view: 'invoices', label: 'Facturas', icon: <Receipt className="h-5 w-5" /> },
    {
      view: 'messages',
      label: 'Mensajes',
      icon: <MessageSquare className="h-5 w-5" />,
      badge: unreadCount,
    },
  ];

  const adminLinks: NavItem[] = [
    { view: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { view: 'clients', label: 'Clientes', icon: <Users className="h-5 w-5" /> },
    { view: 'projects', label: 'Proyectos', icon: <FolderKanban className="h-5 w-5" /> },
    { view: 'deliverables', label: 'Entregables', icon: <ClipboardCheck className="h-5 w-5" /> },
    { view: 'invoices', label: 'Facturas', icon: <Receipt className="h-5 w-5" /> },
    {
      view: 'messages',
      label: 'Mensajes',
      icon: <MessageSquare className="h-5 w-5" />,
      badge: unreadCount,
    },
  ];

  const links = type === 'admin' ? adminLinks : clientLinks;

  const handleNav = (view: string) => {
    onNavigate(view);
    setMobileOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
          <Sparkles className="h-4.5 w-4.5" />
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none">
            ClientPortal
          </h1>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">
            {type === 'admin' ? 'Admin Panel' : 'Client Portal'}
          </p>
        </div>
        {/* Mobile close button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden ml-auto h-8 w-8 text-slate-400"
          onClick={() => setMobileOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Separator className="bg-slate-100 mx-3 w-auto" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map((link, i) => {
          const isActive = activeView === link.view;
          return (
            <motion.button
              key={link.view}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
              onClick={() => handleNav(link.view)}
              className={`
                relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-200 group cursor-pointer
                ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }
              `}
            >
              <span
                className={`shrink-0 transition-colors ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
                }`}
              >
                {link.icon}
              </span>
              <span className="flex-1 text-left">{link.label}</span>
              {link.badge && link.badge > 0 && (
                <Badge
                  className={`
                    h-5 min-w-[20px] px-1.5 text-[10px] font-bold border-0
                    ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-amber-500 text-white'
                    }
                  `}
                >
                  {link.badge > 99 ? '99+' : link.badge}
                </Badge>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* User section */}
      <Separator className="bg-slate-100 mx-3 w-auto" />
      <div className="px-3 py-4 space-y-2">
        <div className="flex items-center gap-3 px-3 py-2">
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm font-bold">
              {user?.fullName ? getInitials(user.fullName) : 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">
              {user?.fullName ?? 'User'}
            </p>
            <Badge
              variant="outline"
              className={`text-[10px] font-semibold mt-0.5 px-1.5 py-0 ${
                type === 'admin'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              {type === 'admin' ? 'Admin' : 'Client'}
            </Badge>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all duration-200 group cursor-pointer"
        >
          <LogOut className="h-5 w-5 text-slate-400 group-hover:text-rose-500 transition-colors" />
          <span>Log out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm text-slate-700 hover:bg-slate-50 transition-colors"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 z-50 w-64 bg-white border-r border-slate-100 shadow-2xl md:hidden"
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-100 z-30 flex-col">
        {sidebarContent}
      </aside>
    </>
  );
}