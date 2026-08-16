// BELENTANI OMEGA ULTRA
// Autoría: Pedro Belentani
// Fecha: 2026-08-14
import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

// ============ TYPES ============
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'client';
  fullName: string;
  company: string;
  avatarUrl?: string;
  clientId?: string;
}

export interface Client {
  id: string;
  userId: string;
  companyName: string;
  contactEmail: string;
  phone?: string;
  notes?: string;
  healthScore?: number;
  churnRisk?: number;
  totalRevenue?: number;
  user?: { id: string; email: string; fullName: string; company: string; avatarUrl?: string };
  _count?: { projects: number; invoices: number };
  projects?: Project[];
  invoices?: Invoice[];
}

export interface Project {
  id: string;
  clientId: string;
  title: string;
  description?: string;
  status: 'Discovery' | 'In Progress' | 'Review' | 'Completed';
  startDate?: string;
  targetEndDate?: string;
  createdAt: string;
  updatedAt: string;
  client?: { id: string; companyName: string };
  deliverables?: Deliverable[];
  _count?: { messages: number };
}

export interface Deliverable {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  dueDate: string;
  status: 'Pending' | 'In Review' | 'Approved' | 'Rejected';
  project?: { id: string; title: string; client?: { companyName: string } };
}

export interface Invoice {
  id: string;
  clientId: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue';
  totalAmount: number;
  notes?: string;
  client?: { id: string; companyName: string };
  items?: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  projectId?: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender?: { id: string; fullName: string; role: string; avatarUrl?: string };
  recipient?: { id: string; fullName: string; role: string; avatarUrl?: string };
  project?: { id: string; title: string };
}

// ============ VIEW TYPES ============
export type AuthView = 'login' | 'signup';
export type ClientView = 'dashboard' | 'projects' | 'project-detail' | 'invoices' | 'invoice-detail' | 'messages' | 'audio-lab';
export type AdminView = 'dashboard' | 'clients' | 'client-detail' | 'projects' | 'project-detail' | 'deliverables' | 'invoices' | 'invoice-create' | 'invoice-detail' | 'messages' | 'analytics' | 'ai-insights' | 'settings' | 'kanban' | 'audio-lab';

// ============ STORE ============
interface PortalState {
  // Auth
  token: string | null;
  user: User | null;
  authView: AuthView;

  // Views
  clientView: ClientView;
  adminView: AdminView;
  selectedClientId: string | null;
  selectedProjectId: string | null;
  selectedInvoiceId: string | null;
  selectedChatUserId: string | null;

  // Data
  clients: Client[];
  projects: Project[];
  invoices: Invoice[];
  messages: Message[];
  stats: Record<string, unknown>;
  loading: boolean;
  sidebarOpen: boolean;

  // Socket
  socket: Socket | null;

  // Actions
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  setAuthView: (view: AuthView) => void;
  setClientView: (view: ClientView) => void;
  setAdminView: (view: AdminView) => void;
  setSelectedClientId: (id: string | null) => void;
  setSelectedProjectId: (id: string | null) => void;
  setSelectedInvoiceId: (id: string | null) => void;
  setSelectedChatUserId: (id: string | null) => void;
  setClients: (clients: Client[]) => void;
  setProjects: (projects: Project[]) => void;
  setInvoices: (invoices: Invoice[]) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setStats: (stats: Record<string, unknown>) => void;
  setLoading: (loading: boolean) => void;
  toggleSidebar: () => void;
  initSocket: (userId: string) => void;
  disconnectSocket: () => void;
  logout: () => void;
}

export const usePortalStore = create<PortalState>((set, get) => ({
  // Initial state
  token: typeof window !== 'undefined' ? localStorage.getItem('portal_token') : null,
  user: null,
  authView: 'login',
  clientView: 'dashboard',
  adminView: 'dashboard',
  selectedClientId: null,
  selectedProjectId: null,
  selectedInvoiceId: null,
  selectedChatUserId: null,
  clients: [],
  projects: [],
  invoices: [],
  messages: [],
  stats: {},
  loading: false,
  sidebarOpen: typeof window !== 'undefined' && window.innerWidth >= 768,
  socket: null,

  // Auth actions
  setToken: (token) => {
    if (token) localStorage.setItem('portal_token', token);
    else localStorage.removeItem('portal_token');
    set({ token });
  },
  setUser: (user) => set({ user }),
  setAuthView: (authView) => set({ authView }),

  setClientView: (view) => set({ clientView: view }),
  setAdminView: (view) => set({ adminView: view }),
  setSelectedClientId: (id) => set({ selectedClientId: id }),
  setSelectedProjectId: (id) => set({ selectedProjectId: id }),
  setSelectedInvoiceId: (id) => set({ selectedInvoiceId: id }),
  setSelectedChatUserId: (id) => set({ selectedChatUserId: id }),

  // Data actions
  setClients: (clients) => set({ clients }),
  setProjects: (projects) => set({ projects }),
  setInvoices: (invoices) => set({ invoices }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((s) => ({ messages: [...s.messages, message] })),
  setStats: (stats) => set({ stats }),
  setLoading: (loading) => set({ loading }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  // Socket
  initSocket: (userId) => {
    const existing = get().socket;
    if (existing) existing.disconnect();

    const fallbackSocketUrl =
      typeof window === 'undefined'
        ? 'http://127.0.0.1:3004'
        : `${window.location.protocol}//${window.location.hostname}:3004`;
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || fallbackSocketUrl);
    socket.on('connect', () => {
      socket.emit('register', userId);
    });
    socket.on('new-message', (message: Message) => {
      get().addMessage(message);
    });
    set({ socket });
  },
  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },

  logout: () => {
    const { socket, setToken, setUser } = get();
    if (socket) socket.disconnect();
    setToken(null);
    setUser(null);
    localStorage.removeItem('portal_token');
    set({
      user: null,
      token: null,
      clients: [],
      projects: [],
      invoices: [],
      messages: [],
      stats: {},
      selectedClientId: null,
      selectedProjectId: null,
      selectedInvoiceId: null,
      selectedChatUserId: null,
      socket: null,
      authView: 'login',
    });
    fetch('/api/auth/me', { method: 'DELETE' }).catch(() => {});
  },
}));
