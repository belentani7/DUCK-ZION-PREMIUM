// BELENTANI OMEGA ULTRA
// Autoría: Pedro Belentani
// Fecha: 2026-08-14
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  FileText,
  MessageSquare,
  PackageCheck,
  PlusCircle,
  Send,
  Clock,
  UserCircle,
  AudioLines,
  type LucideIcon,
} from 'lucide-react';
import type { Variants } from 'framer-motion';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { usePortalStore } from '@/lib/store';
import type { AdminView, ClientView } from '@/lib/store';

type RecentEntry = {
  id: string;
  label: string;
  icon: LucideIcon;
  action: () => void;
  timestamp: number;
};

// ─── View definitions ───────────────────────────────────────────────────

interface NavItem {
  label: string;
  icon: LucideIcon;
  shortcut?: string;
  /** Only one of these should be set */
  adminView?: AdminView;
  clientView?: ClientView;
  /** Extra side-effect before navigation */
  onSelect?: () => void;
}

const ADMIN_NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, shortcut: 'D', adminView: 'dashboard' },
  { label: 'Clients', icon: Users, shortcut: 'C', adminView: 'clients' },
  { label: 'Projects', icon: FolderKanban, shortcut: 'P', adminView: 'projects' },
  { label: 'Deliverables', icon: PackageCheck, shortcut: 'R', adminView: 'deliverables' },
  { label: 'Invoices', icon: FileText, shortcut: 'I', adminView: 'invoices' },
  { label: 'Messages', icon: MessageSquare, shortcut: 'M', adminView: 'messages' },
  { label: 'Audio Lab', icon: AudioLines, shortcut: 'A', adminView: 'audio-lab' },
];

const CLIENT_NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, shortcut: 'D', clientView: 'dashboard' },
  { label: 'Projects', icon: FolderKanban, shortcut: 'P', clientView: 'projects' },
  { label: 'Invoices', icon: FileText, shortcut: 'I', clientView: 'invoices' },
  { label: 'Messages', icon: MessageSquare, shortcut: 'M', clientView: 'messages' },
  { label: 'Audio Lab', icon: AudioLines, shortcut: 'A', clientView: 'audio-lab' },
];

// ─── Motion variants ────────────────────────────────────────────────────

const contentVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: -8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 400, damping: 30, mass: 0.8 },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: -4,
    transition: { duration: 0.12, ease: 'easeIn' },
  },
};

// ─── Recent items helper ────────────────────────────────────────────────

const MAX_RECENT = 5;

// ─── Component ──────────────────────────────────────────────────────────

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [recentItems, setRecentItems] = useState<RecentEntry[]>([]);

  const user = usePortalStore((s) => s.user);
  const setAdminView = usePortalStore((s) => s.setAdminView);
  const setClientView = usePortalStore((s) => s.setClientView);
  const projects = usePortalStore((s) => s.projects);
  const invoices = usePortalStore((s) => s.invoices);

  const role = user?.role ?? 'client';
  const isAdmin = role === 'admin';

  // ── Keyboard shortcut ────────────────────────────────────────────────
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ── Navigation executor ──────────────────────────────────────────────
  const navigate = useCallback(
    (item: NavItem) => {
      if (isAdmin && item.adminView) {
        setAdminView(item.adminView);
      } else if (!isAdmin && item.clientView) {
        setClientView(item.clientView);
      }
      item.onSelect?.();
    },
    [isAdmin, setAdminView, setClientView],
  );

  // ── Add to recent ───────────────────────────────────────────────────
  const pushRecent = useCallback(
    (label: string, icon: LucideIcon, action: () => void) => {
      const entry: RecentEntry = {
        id: `${label}-${Date.now()}`,
        label,
        icon,
        action,
        timestamp: Date.now(),
      };
      setRecentItems((prev) =>
        [entry, ...prev.filter((r) => r.label !== label)].slice(0, MAX_RECENT),
      );
    },
    [],
  );

  // ── Item selection handler ──────────────────────────────────────────
  const handleSelect = useCallback(
    (item: NavItem) => {
      const action = () => navigate(item);
      pushRecent(item.label, item.icon, action);
      action();
      setOpen(false);
    },
    [navigate, pushRecent],
  );

  // ── Quick actions ───────────────────────────────────────────────────
  const quickActions = useMemo<NavItem[]>(() => {
    const actions: NavItem[] = [
      {
        label: 'Go to Messages',
        icon: Send,
        shortcut: '⌘M',
        adminView: 'messages',
        clientView: 'messages',
      },
    ];
    if (isAdmin) {
      actions.unshift({
        label: 'Create Invoice',
        icon: PlusCircle,
        shortcut: '⌘N',
        adminView: 'invoice-create',
      });
    }
    return actions;
  }, [isAdmin]);

  // ── Dynamic recent items from store data (projects & invoices) ───────
  const dynamicRecent = useMemo(() => {
    const items: { id: string; label: string; icon: LucideIcon; action: () => void }[] = [];

    // Latest 2 projects
    const sortedProjects = [...projects]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 2);
    for (const p of sortedProjects) {
      items.push({
        id: `project-${p.id}`,
        label: p.title,
        icon: FolderKanban,
        action: () => {
          usePortalStore.getState().setSelectedProjectId(p.id);
          if (isAdmin) setAdminView('project-detail');
          else setClientView('project-detail');
        },
      });
    }

    // Latest 2 invoices
    const sortedInvoices = [...invoices]
      .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
      .slice(0, 2);
    for (const inv of sortedInvoices) {
      items.push({
        id: `invoice-${inv.id}`,
        label: `${inv.invoiceNumber} — ${inv.client?.companyName ?? 'Invoice'}`,
        icon: FileText,
        action: () => {
          usePortalStore.getState().setSelectedInvoiceId(inv.id);
          if (isAdmin) setAdminView('invoice-detail');
          else setClientView('invoice-detail');
        },
      });
    }

    return items;
  }, [projects, invoices, isAdmin, setAdminView, setClientView]);

  // ── Nav items for current role ───────────────────────────────────────
  const navItems = isAdmin ? ADMIN_NAV_ITEMS : CLIENT_NAV_ITEMS;

  return (
    <AnimatePresence>
      {open && (
        <Dialog open={open} onOpenChange={setOpen}>
          {/* Accessible titles — visually hidden */}
          <DialogTitle className="sr-only">Command Palette</DialogTitle>
          <DialogDescription className="sr-only">
            Search for pages, actions, and recent items
          </DialogDescription>

          <DialogContent
            className="
              overflow-hidden !p-0
              sm:max-w-[640px]
              rounded-2xl
              border-border/50
              bg-popover/80 backdrop-blur-xl
              shadow-2xl shadow-black/10
              dark:shadow-black/40
              [&>button]:top-3 [&>button]:right-3
            "
            showCloseButton
            asChild
          >
            <motion.div
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex flex-col"
            >
              <Command
                className="[
                  --cmdk-bg:transparent;
                  &[data-slot=command]:bg-transparent;
                ]"
                shouldFilter={true}
              >
                {/* Search input area */}
                <div className="flex items-center border-b border-border/60 px-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-muted-foreground shrink-0"
                    aria-hidden="true"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                  <CommandInput
                    placeholder={
                      isAdmin
                        ? 'Search pages, actions, projects...'
                        : 'Search pages, actions, projects...'
                    }
                    className="h-12 border-0 bg-transparent px-3 text-sm font-normal placeholder:text-muted-foreground/70 focus:ring-0"
                  />
                  <kbd
                    className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-border/60 bg-muted/80 px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex
                      dark:border-border/40 dark:bg-muted/30
                    "
                  >
                    ESC
                  </kbd>
                </div>

                <CommandList className="max-h-[420px] overflow-y-auto overscroll-contain py-2">
                  <CommandEmpty className="py-10 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="bg-muted/60 dark:bg-muted/30 rounded-full p-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-muted-foreground"
                          aria-hidden="true"
                        >
                          <circle cx="11" cy="11" r="8" />
                          <path d="m21 21-4.3-4.3" />
                          <path d="M8 11h6" />
                        </svg>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        No results found.
                      </p>
                      <p className="text-xs text-muted-foreground/70">
                        Try a different search term
                      </p>
                    </div>
                  </CommandEmpty>

                  {/* Quick Actions */}
                  {quickActions.length > 0 && (
                    <CommandGroup heading="Quick Actions" className="px-2">
                      {quickActions.map((item) => (
                        <CommandItem
                          key={item.label}
                          value={item.label}
                          onSelect={() => handleSelect(item)}
                          className="
                            flex items-center gap-3 rounded-lg px-3 py-2.5
                            text-sm
                            data-[selected=true]:bg-accent/80 data-[selected=true]:text-accent-foreground
                            data-[selected=true]:shadow-sm
                            transition-colors duration-100
                            cursor-pointer
                          "
                        >
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/15">
                            <item.icon className="size-4" />
                          </span>
                          <span className="flex-1 font-medium">{item.label}</span>
                          {item.shortcut && (
                            <CommandShortcut className="text-[10px] tracking-wider">
                              {item.shortcut}
                            </CommandShortcut>
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}

                  <CommandSeparator className="my-1" />

                  {/* Navigation */}
                  <CommandGroup heading="Navigation" className="px-2">
                    {navItems.map((item) => (
                      <CommandItem
                        key={item.label}
                        value={item.label}
                        onSelect={() => handleSelect(item)}
                        className="
                          flex items-center gap-3 rounded-lg px-3 py-2.5
                          text-sm
                          data-[selected=true]:bg-accent/80 data-[selected=true]:text-accent-foreground
                          data-[selected=true]:shadow-sm
                          transition-colors duration-100
                          cursor-pointer
                        "
                      >
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/70 text-muted-foreground dark:bg-muted/30 dark:text-muted-foreground">
                          <item.icon className="size-4" />
                        </span>
                        <span className="flex-1">{item.label}</span>
                        {item.shortcut && (
                          <CommandShortcut className="text-[10px] tracking-wider">
                            {item.shortcut}
                          </CommandShortcut>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>

                  {/* Recent items — either manual history or dynamic store data */}
                  {(recentItems.length > 0 || dynamicRecent.length > 0) && (
                    <>
                      <CommandSeparator className="my-1" />
                      <CommandGroup heading="Recent" className="px-2">
                        {/* Manual recent history */}
                        {recentItems.map((entry) => (
                          <CommandItem
                            key={entry.id}
                            value={`recent-${entry.label}`}
                            onSelect={() => {
                              entry.action();
                              setOpen(false);
                            }}
                            className="
                              flex items-center gap-3 rounded-lg px-3 py-2.5
                              text-sm
                              data-[selected=true]:bg-accent/80 data-[selected=true]:text-accent-foreground
                              data-[selected=true]:shadow-sm
                              transition-colors duration-100
                              cursor-pointer
                            "
                          >
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground dark:bg-muted/20 dark:text-muted-foreground/70">
                              <entry.icon className="size-4" />
                            </span>
                            <span className="flex-1 text-popover-foreground/80">{entry.label}</span>
                            <Clock className="size-3 text-muted-foreground/50" />
                          </CommandItem>
                        ))}
                        {/* Dynamic recent from store (projects & invoices) */}
                        {dynamicRecent.map((entry) => (
                          <CommandItem
                            key={entry.id}
                            value={`recent-${entry.label}`}
                            onSelect={() => {
                              entry.action();
                              setOpen(false);
                            }}
                            className="
                              flex items-center gap-3 rounded-lg px-3 py-2.5
                              text-sm
                              data-[selected=true]:bg-accent/80 data-[selected=true]:text-accent-foreground
                              data-[selected=true]:shadow-sm
                              transition-colors duration-100
                              cursor-pointer
                            "
                          >
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground dark:bg-muted/20 dark:text-muted-foreground/70">
                              <entry.icon className="size-4" />
                            </span>
                            <span className="flex-1 truncate text-popover-foreground/80">
                              {entry.label}
                            </span>
                            <Clock className="size-3 shrink-0 text-muted-foreground/50" />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </>
                  )}
                </CommandList>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-border/60 px-4 py-2">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <kbd className="rounded border border-border/60 bg-muted/60 dark:bg-muted/30 px-1 py-0.5 font-mono text-[10px]">
                        ↑↓
                      </kbd>
                      <span>Navigate</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="rounded border border-border/60 bg-muted/60 dark:bg-muted/30 px-1 py-0.5 font-mono text-[10px]">
                        ↵
                      </kbd>
                      <span>Select</span>
                    </span>
                    <span className="hidden sm:flex items-center gap-1">
                      <kbd className="rounded border border-border/60 bg-muted/60 dark:bg-muted/30 px-1 py-0.5 font-mono text-[10px]">
                        esc
                      </kbd>
                      <span>Close</span>
                    </span>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
                    <UserCircle className="size-3" />
                    <span className="capitalize">{role}</span>
                  </span>
                </div>
              </Command>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
