// BELENTANI OMEGA ULTRA
// Autoría: Pedro Belentani
// Fecha: 2026-08-14
'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePortalStore, type Client, type Project, type Invoice, type Message } from '@/lib/store';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { toast } from 'sonner';
import {
  LayoutDashboard, FolderKanban, Receipt, MessageSquare, Users, ClipboardCheck,
  LogOut, Menu, X, ChevronRight, Plus, Eye, ArrowLeft, Search, Send,
  Sparkles, Shield, Clock, DollarSign, TrendingUp, AlertTriangle, CheckCircle2,
  Loader2, Building2, Mail, Phone, CalendarDays, Settings, Brain, Heart, Activity as ActivityIcon,
  Kanban, Download, FileDown, Zap, MessageCircle, BarChart3, Command, AudioLines
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { StatusBadge } from '@/components/StatusBadge';
import { DashboardCard } from '@/components/DashboardCard';
import { MessageThread } from '@/components/MessageThread';
import { CreateInvoiceForm } from '@/components/CreateInvoiceForm';
import { ProjectDetail } from '@/components/ProjectDetail';
import { InvoiceDetail } from '@/components/InvoiceDetail';
import { HealthScoreGauge } from '@/components/HealthScoreGauge';
import { RevenueChart } from '@/components/RevenueChart';
import { ProjectStatusChart } from '@/components/ProjectStatusChart';
import { ActivityFeed } from '@/components/ActivityFeed';
import { ClientHealthTable } from '@/components/ClientHealthTable';
import { NotificationBell } from '@/components/NotificationBell';
import { AIInsightsPanel } from '@/components/AIInsightsPanel';
import { SettingsPanel } from '@/components/SettingsPanel';
import { CommandPalette } from '@/components/CommandPalette';
import { KanbanBoard } from '@/components/KanbanBoard';
import { AudioLab } from '@/components/AudioLab';

// ============ API HELPER ============
async function api(path: string, options?: RequestInit) {
  const token = usePortalStore.getState().token;
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Error de servidor' }));
    throw new Error(err.error || 'Error de servidor');
  }
  return res.json();
}

// ============ ANIMATION VARIANTS ============
const pageVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.06 } },
};

const staggerItem = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

// ============ FORMAT HELPERS ============
function formatCurrency(n: number) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n);
}
function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}
function formatTime(d: string) {
  return new Date(d).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}
function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `hace ${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `hace ${days}d`;
}

// ============ EXPORT BUTTON ============
function ExportButton({ type, format = 'csv' }: { type: string; format?: string }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => window.open(`/api/export?type=${type}&format=${format}`)}
      className="rounded-xl gap-1.5 text-muted-foreground hover:text-foreground"
    >
      <Download className="w-4 h-4" />
      <span className="hidden sm:inline">Exportar</span>
    </Button>
  );
}

// ============ LOGIN/REGISTER VIEW (PREMIUM) ============
function AuthView() {
  const { authView, setAuthView, setToken, setUser, initSocket } = usePortalStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const action = authView === 'login' ? 'login' : 'signup';
      const body = authView === 'login'
        ? { email, password }
        : { email, password, fullName, company };
      const data = await api(`/api/auth/${action}`, { method: 'POST', body: JSON.stringify(body) });
      setToken(data.token);
      setUser(data.user);
      initSocket(data.user.id);
      toast.success(authView === 'login' ? 'Bienvenido de vuelta' : 'Cuenta creada exitosamente');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 via-background to-amber-900/30 dark:from-emerald-950/60 dark:via-background dark:to-amber-950/40" />

      {/* Animated floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-emerald-500/20 dark:bg-emerald-400/10 rounded-full blur-3xl animate-[float_8s_ease-in-out_infinite]" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-500/15 dark:bg-amber-400/10 rounded-full blur-3xl animate-[float_10s_ease-in-out_infinite_1s]" />
      <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-violet-500/10 dark:bg-violet-400/8 rounded-full blur-3xl animate-[float_12s_ease-in-out_infinite_2s]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Glass-morphism card */}
        <div className="bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="px-8 pt-8 pb-6">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2.5 mb-6"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-foreground">
                ClientPortal <span className="text-emerald-400">Pro</span>
              </span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-foreground mb-1"
            >
              {authView === 'login' ? 'Bienvenido de vuelta' : 'Crear cuenta'}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="text-muted-foreground text-sm"
            >
              {authView === 'login'
                ? 'Inicia sesión para acceder a tu portal'
                : 'Regístrate como cliente para comenzar'}
            </motion.p>
          </div>

          <div className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 px-4 py-2.5 rounded-xl text-sm border border-rose-200 dark:border-rose-800/50"
                >
                  {error}
                </motion.div>
              )}

              {authView === 'signup' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-foreground/80">Nombre completo</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="Tu nombre"
                      required
                      className="bg-white/10 dark:bg-white/5 border-white/20 dark:border-white/10 text-foreground placeholder:text-muted-foreground/60 rounded-xl h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-foreground/80">Empresa</Label>
                    <Input
                      id="company"
                      value={company}
                      onChange={e => setCompany(e.target.value)}
                      placeholder="Nombre de tu empresa"
                      className="bg-white/10 dark:bg-white/5 border-white/20 dark:border-white/10 text-foreground placeholder:text-muted-foreground/60 rounded-xl h-11"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground/80">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  className="bg-white/10 dark:bg-white/5 border-white/20 dark:border-white/10 text-foreground placeholder:text-muted-foreground/60 rounded-xl h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground/80">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="bg-white/10 dark:bg-white/5 border-white/20 dark:border-white/10 text-foreground placeholder:text-muted-foreground/60 rounded-xl h-11"
                />
              </div>

              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white h-11 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {authView === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
                </Button>
              </motion.div>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              {authView === 'login' ? (
                <>¿No tienes cuenta?{' '}
                  <button onClick={() => { setAuthView('signup'); setError(''); }} className="text-emerald-400 font-medium hover:text-emerald-300 transition-colors">
                    Regístrate
                  </button>
                </>
              ) : (
                <>¿Ya tienes cuenta?{' '}
                  <button onClick={() => { setAuthView('login'); setError(''); }} className="text-emerald-400 font-medium hover:text-emerald-300 transition-colors">
                    Inicia sesión
                  </button>
                </>
              )}
            </div>

            <Separator className="my-5 bg-white/10" />

            <div className="bg-white/5 dark:bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-xs font-medium text-muted-foreground mb-2">Cuentas de demostración:</p>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <p><span className="font-mono text-foreground/70">admin@portal.com</span> / <span className="font-mono text-foreground/70">Admin123!</span></p>
                <p><span className="font-mono text-foreground/70">maria@techcorp.com</span> / <span className="font-mono text-foreground/70">Cliente123!</span></p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Global CSS for floating animation */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
      `}</style>
    </div>
  );
}

// ============ CLIENT DASHBOARD ============
function ClientDashboardView() {
  const { user, projects, invoices, messages, stats, setClientView, setSelectedProjectId, setSelectedInvoiceId } = usePortalStore();
  const statValues = stats as Record<string, number>;
  const recentMessages = messages.slice(-3).reverse();
  const upcomingDeliverables = projects.flatMap(p => (p.deliverables || []).filter(d => d.status !== 'Approved')).slice(0, 5);

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">¡Hola, {user?.fullName}!</h1>
        <p className="text-muted-foreground mt-1">Aquí tienes un resumen de tu actividad</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard title="Proyectos activos" value={statValues?.totalProjects || 0} icon={<FolderKanban className="w-5 h-5 text-emerald-600" />} />
        <DashboardCard title="Entregables pendientes" value={statValues?.pendingDeliverables || 0} icon={<ClipboardCheck className="w-5 h-5 text-amber-600" />} />
        <DashboardCard title="Facturas pendientes" value={statValues?.unpaidInvoices || 0} icon={<Receipt className="w-5 h-5 text-rose-600" />} description={formatCurrency(statValues?.totalOwed || 0)} />
        <DashboardCard title="Mensajes nuevos" value={statValues?.unreadMessages || 0} icon={<MessageSquare className="w-5 h-5 text-violet-600" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <Card className="shadow-lg shadow-black/5 dark:shadow-black/20 border-0 rounded-2xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Proyectos recientes</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setClientView('projects')} className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300">
                Ver todos <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {projects.slice(0, 4).map(p => (
                <motion.div key={p.id} variants={staggerItem}
                  onClick={() => { setSelectedProjectId(p.id); setClientView('project-detail'); }}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 cursor-pointer transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors text-foreground">{p.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{p.client?.companyName || user?.company}</p>
                  </div>
                  <StatusBadge status={p.status} type="project" />
                </motion.div>
              ))}
              {projects.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No hay proyectos</p>}
            </div>
          </CardContent>
        </Card>

        {/* Recent Messages */}
        <Card className="shadow-lg shadow-black/5 dark:shadow-black/20 border-0 rounded-2xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Mensajes recientes</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setClientView('messages')} className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300">
                Ver chat <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentMessages.map(m => (
                <div key={m.id} className="p-3 rounded-xl bg-muted/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-muted-foreground">{m.sender?.fullName}</span>
                    <span className="text-xs text-muted-foreground">{timeAgo(m.createdAt)}</span>
                  </div>
                  <p className="text-sm text-foreground line-clamp-2">{m.content}</p>
                </div>
              ))}
              {recentMessages.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No hay mensajes</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Deliverables */}
      {upcomingDeliverables.length > 0 && (
        <Card className="shadow-lg shadow-black/5 dark:shadow-black/20 border-0 rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Entregables próximos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingDeliverables.map(d => {
                const isOverdue = new Date(d.dueDate) < new Date() && d.status !== 'Approved';
                return (
                  <div key={d.id} className={`flex items-center justify-between p-3 rounded-xl ${isOverdue ? 'bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-800/50' : 'bg-muted/30'}`}>
                    <div>
                      <p className="text-sm font-medium text-foreground">{d.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{d.project?.title}</p>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={d.status} type="deliverable" />
                      <p className={`text-xs mt-1 ${isOverdue ? 'text-rose-600 dark:text-rose-400 font-medium' : 'text-muted-foreground'}`}>
                        <CalendarDays className="w-3 h-3 inline mr-1" />{formatDate(d.dueDate)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}

// ============ PROJECTS LIST VIEW ============
function ProjectsListView({ isAdmin }: { isAdmin: boolean }) {
  const { projects, setSelectedProjectId, setAdminView, setClientView, user } = usePortalStore();
  const navigate = (id: string) => {
    setSelectedProjectId(id);
    if (isAdmin) setAdminView('project-detail');
    else setClientView('project-detail');
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Proyectos</h1>
          <p className="text-muted-foreground mt-1">{projects.length} proyecto{projects.length !== 1 ? 's' : ''} en total</p>
        </div>
        {isAdmin && <ExportButton type="projects" />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {projects.map((p, i) => (
          <motion.div key={p.id} variants={staggerItem} initial="initial" animate="animate" transition={{ delay: i * 0.05 }}>
            <Card className="shadow-lg shadow-black/5 dark:shadow-black/20 border-0 rounded-2xl hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/30 transition-all duration-300 cursor-pointer group h-full"
              onClick={() => navigate(p.id)}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base font-semibold group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate text-foreground">{p.title}</CardTitle>
                    {!isAdmin && (
                      <CardDescription className="mt-1">{p.description?.substring(0, 80)}...</CardDescription>
                    )}
                    {isAdmin && p.client && (
                      <CardDescription className="mt-1">{p.client.companyName}</CardDescription>
                    )}
                  </div>
                  <StatusBadge status={p.status} type="project" />
                </div>
              </CardHeader>
              <CardContent>
                {p.deliverables && p.deliverables.length > 0 && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Progreso de entregables</span>
                      <span className="font-medium text-foreground">{p.deliverables.filter(d => d.status === 'Approved').length}/{p.deliverables.length}</span>
                    </div>
                    <Progress value={(p.deliverables.filter(d => d.status === 'Approved').length / p.deliverables.length) * 100} className="h-2" />
                  </div>
                )}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {p.startDate && <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />{formatDate(p.startDate)}</span>}
                  {p.targetEndDate && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(p.targetEndDate)}</span>}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      {projects.length === 0 && (
        <Card className="shadow-lg shadow-black/5 dark:shadow-black/20 border-0 rounded-2xl p-12 text-center">
          <FolderKanban className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">No hay proyectos disponibles</p>
        </Card>
      )}
    </motion.div>
  );
}

// ============ INVOICES LIST VIEW ============
function InvoicesListView({ isAdmin }: { isAdmin: boolean }) {
   const { invoices, setSelectedInvoiceId, setAdminView, setClientView } = usePortalStore();
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? invoices : invoices.filter(i => i.status === filter);

  const navigate = (id: string) => {
    setSelectedInvoiceId(id);
    if (isAdmin) setAdminView('invoice-detail');
    else setClientView('invoice-detail');
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Facturas</h1>
          <p className="text-muted-foreground mt-1">{invoices.length} factura{invoices.length !== 1 ? 's' : ''} en total</p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && <ExportButton type="invoices" />}
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="Draft">Borrador</SelectItem>
              <SelectItem value="Sent">Enviada</SelectItem>
              <SelectItem value="Paid">Pagada</SelectItem>
              <SelectItem value="Overdue">Vencida</SelectItem>
            </SelectContent>
          </Select>
          {isAdmin && (
            <Button onClick={() => setAdminView('invoice-create')} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
              <Plus className="w-4 h-4 mr-2" /> Nueva factura
            </Button>
          )}
        </div>
      </div>

      <Card className="shadow-lg shadow-black/5 dark:shadow-black/20 border-0 rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Número</TableHead>
              {isAdmin && <TableHead className="font-semibold">Cliente</TableHead>}
              <TableHead className="font-semibold">Fecha</TableHead>
              <TableHead className="font-semibold">Vencimiento</TableHead>
              <TableHead className="font-semibold">Estado</TableHead>
              <TableHead className="font-semibold text-right">Importe</TableHead>
              <TableHead className="font-semibold w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(inv => (
              <TableRow key={inv.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate(inv.id)}>
                <TableCell className="font-mono font-medium text-sm text-foreground">{inv.invoiceNumber}</TableCell>
                {isAdmin && inv.client && <TableCell className="text-sm text-foreground">{inv.client.companyName}</TableCell>}
                <TableCell className="text-sm text-muted-foreground">{formatDate(inv.issueDate)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{formatDate(inv.dueDate)}</TableCell>
                <TableCell><StatusBadge status={inv.status} type="invoice" /></TableCell>
                <TableCell className="text-right font-semibold text-foreground">{formatCurrency(inv.totalAmount)}</TableCell>
                <TableCell><Eye className="w-4 h-4 text-muted-foreground" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            <Receipt className="w-10 h-10 mx-auto mb-2 text-muted-foreground/30" />
            <p>No hay facturas</p>
          </div>
        )}
      </Card>
    </motion.div>
  );
}

// ============ MESSAGES VIEW ============
function MessagesView() {
  const { user, clients, selectedChatUserId, setSelectedChatUserId, setAdminView, setClientView } = usePortalStore();
  const isAdmin = user?.role === 'admin';

  const chatPartners = isAdmin
    ? clients.map(c => ({ id: c.userId, name: c.user?.fullName || c.companyName, company: c.companyName }))
    : [{ id: 'admin', name: 'Admin Principal', company: 'Mi Agencia' }];

  const activePartner = chatPartners.find(p => p.id === selectedChatUserId) || chatPartners[0];

  useEffect(() => {
    if (!selectedChatUserId && chatPartners.length > 0) {
      setSelectedChatUserId(chatPartners[0].id);
    }
  }, [selectedChatUserId, chatPartners.length]);

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="h-[calc(100vh-5rem)] flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-foreground">Mensajes</h1>
        <p className="text-muted-foreground mt-1">Comunicación directa con {isAdmin ? 'tus clientes' : 'el equipo'}</p>
      </div>

      <Card className="shadow-lg shadow-black/5 dark:shadow-black/20 border-0 rounded-2xl flex-1 overflow-hidden flex">
        {/* Contact list */}
        <div className="w-64 border-r border-border/50 bg-muted/30 flex-shrink-0 hidden md:block">
          <ScrollArea className="h-full">
            <div className="p-3 space-y-1">
              {chatPartners.map(partner => (
                <button
                  key={partner.id}
                  onClick={() => setSelectedChatUserId(partner.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                    selectedChatUserId === partner.id
                      ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                      : 'hover:bg-muted/50 text-foreground'
                  }`
                  }
                >
                  <Avatar className="w-9 h-9">
                    <AvatarFallback className={selectedChatUserId === partner.id ? 'bg-emerald-200 dark:bg-emerald-800' : 'bg-muted'}>{partner.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{partner.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{partner.company}</p>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {activePartner ? (
            <MessageThread recipientId={activePartner.id} recipientName={activePartner.name} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <p>Selecciona un contacto para chatear</p>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

// ============ ADMIN: CLIENTS LIST ============
function AdminClientsView() {
  const { clients, setSelectedClientId, setAdminView } = usePortalStore();
  const [search, setSearch] = useState('');
  const filtered = clients.filter(c =>
    c.companyName.toLowerCase().includes(search.toLowerCase()) ||
    c.user?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    c.contactEmail.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
          <p className="text-muted-foreground mt-1">{clients.length} cliente{clients.length !== 1 ? 's' : ''} registrados</p>
        </div>
        <ExportButton type="clients" />
      </div>

      <div className="mb-4 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar clientes..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((c, i) => (
          <motion.div key={c.id} variants={staggerItem} initial="initial" animate="animate" transition={{ delay: i * 0.05 }}>
            <Card className="shadow-lg shadow-black/5 dark:shadow-black/20 border-0 rounded-2xl hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/30 transition-all duration-300 cursor-pointer group"
              onClick={() => { setSelectedClientId(c.id); setAdminView('client-detail'); }}>
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <Avatar className="w-11 h-11">
                    <AvatarFallback className="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold">
                      {(c.user?.fullName || c.companyName).charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">{c.companyName}</h3>
                    <p className="text-sm text-muted-foreground">{c.user?.fullName}</p>
                  </div>
                </div>
                <Separator className="my-3" />
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-3.5 h-3.5" />
                    <span className="truncate">{c.contactEmail}</span>
                  </div>
                  {c.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{c.phone}</span>
                    </div>
                  )}
                  {c._count && (
                    <div className="flex items-center gap-3 pt-2 text-xs">
                      <span className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-medium">{c._count.projects} proyectos</span>
                      <span className="bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full font-medium">{c._count.invoices} facturas</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      {filtered.length === 0 && (
        <Card className="shadow-lg shadow-black/5 dark:shadow-black/20 border-0 rounded-2xl p-12 text-center">
          <Users className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">No se encontraron clientes</p>
        </Card>
      )}
    </motion.div>
  );
}

// ============ ADMIN: CLIENT DETAIL ============
function AdminClientDetailView() {
  const { selectedClientId, setAdminView } = usePortalStore();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedClientId) return;
    let cancelled = false;
    api(`/api/clients/${selectedClientId}`).then(data => {
      if (!cancelled) { setClient(data); setLoading(false); }
    }).catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [selectedClientId]);

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /></div>;
  if (!client) return <p>Cliente no encontrado</p>;

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => setAdminView('clients')} className="text-muted-foreground">
          <ArrowLeft className="w-4 h-4 mr-1" /> Clientes
        </Button>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
        <h1 className="text-2xl font-bold text-foreground">{client.companyName}</h1>
      </div>

      {/* Client Info Card */}
      <Card className="shadow-lg shadow-black/5 dark:shadow-black/20 border-0 rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="w-14 h-14">
              <AvatarFallback className="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-lg font-bold">
                {(client.user?.fullName || client.companyName).charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-foreground">{client.companyName}</h2>
              <p className="text-muted-foreground">{client.user?.fullName} &middot; {client.user?.email}</p>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2 text-foreground"><Mail className="w-4 h-4 text-muted-foreground" />{client.contactEmail}</div>
            {client.phone && <div className="flex items-center gap-2 text-foreground"><Phone className="w-4 h-4 text-muted-foreground" />{client.phone}</div>}
            {client.notes && <div className="text-muted-foreground italic">{client.notes}</div>}
          </div>
        </CardContent>
      </Card>

      {/* Client Projects */}
      {client.projects && client.projects.length > 0 && (
        <Card className="shadow-lg shadow-black/5 dark:shadow-black/20 border-0 rounded-2xl">
          <CardHeader><CardTitle className="text-lg font-semibold">Proyectos ({client.projects.length})</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {client.projects.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                  <div><p className="font-medium text-sm text-foreground">{p.title}</p><p className="text-xs text-muted-foreground mt-0.5">{p.description?.substring(0, 60)}...</p></div>
                  <StatusBadge status={p.status} type="project" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Client Invoices */}
      {client.invoices && client.invoices.length > 0 && (
        <Card className="shadow-lg shadow-black/5 dark:shadow-black/20 border-0 rounded-2xl">
          <CardHeader><CardTitle className="text-lg font-semibold">Facturas ({client.invoices.length})</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Número</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Importe</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {client.invoices.map(inv => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-mono text-sm text-foreground">{inv.invoiceNumber}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(inv.issueDate)}</TableCell>
                    <TableCell><StatusBadge status={inv.status} type="invoice" /></TableCell>
                    <TableCell className="text-right font-semibold text-foreground">{formatCurrency(inv.totalAmount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}

// ============ ADMIN: DELIVERABLES VIEW ============
function AdminDeliverablesView() {
  const { projects } = usePortalStore();
  const [deliverables, setDeliverables] = useState<import('@/lib/store').Deliverable[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api('/api/deliverables').then(data => {
      if (!cancelled) { setDeliverables(data); setLoading(false); }
    }).catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /></div>;

  const pending = deliverables.filter(d => d.status === 'Pending');
  const inReview = deliverables.filter(d => d.status === 'In Review');
  const approved = deliverables.filter(d => d.status === 'Approved');
  const rejected = deliverables.filter(d => d.status === 'Rejected');

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Entregables</h1>
        <p className="text-muted-foreground mt-1">{deliverables.length} entregable{deliverables.length !== 1 ? 's' : ''} en total</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <DashboardCard title="Pendientes" value={pending.length} icon={<Clock className="w-5 h-5 text-amber-600" />} />
        <DashboardCard title="En revisión" value={inReview.length} icon={<Eye className="w-5 h-5 text-sky-600" />} />
        <DashboardCard title="Aprobados" value={approved.length} icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />} />
        <DashboardCard title="Rechazados" value={rejected.length} icon={<AlertTriangle className="w-5 h-5 text-rose-600" />} />
      </div>

      <Card className="shadow-lg shadow-black/5 dark:shadow-black/20 border-0 rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Entregable</TableHead>
              <TableHead>Proyecto</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Vencimiento</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deliverables.map(d => {
              const isOverdue = new Date(d.dueDate) < new Date() && d.status !== 'Approved';
              return (
                <TableRow key={d.id} className={isOverdue ? 'bg-rose-50/50 dark:bg-rose-950/20' : ''}>
                  <TableCell className="font-medium text-sm text-foreground">{d.title}</TableCell>
                  <TableCell className="text-sm text-foreground">{d.project?.title}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{d.project?.client?.companyName || '-'}</TableCell>
                  <TableCell className={`text-sm ${isOverdue ? 'text-rose-600 dark:text-rose-400 font-medium' : 'text-muted-foreground'}`}>{formatDate(d.dueDate)}</TableCell>
                  <TableCell><StatusBadge status={d.status} type="deliverable" /></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </motion.div>
  );
}

// ============ ADMIN: CREATE INVOICE VIEW ============
function AdminCreateInvoiceView() {
  const { setAdminView } = usePortalStore();
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => setAdminView('invoices')} className="text-muted-foreground">
          <ArrowLeft className="w-4 h-4 mr-1" /> Facturas
        </Button>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
        <h1 className="text-2xl font-bold text-foreground">Nueva factura</h1>
      </div>
      <Card className="shadow-lg shadow-black/5 dark:shadow-black/20 border-0 rounded-2xl">
        <CardContent className="p-6">
          <CreateInvoiceForm onSuccess={() => setAdminView('invoices')} />
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============ ADMIN DASHBOARD (ENHANCED) ============
function AdminDashboardView() {
  const { clients, projects, invoices, stats, setAdminView } = usePortalStore();
  const s = stats as Record<string, number>;
  const invoicesByStatus = (stats as Record<string, unknown>).invoicesByStatus as { status: string; _count: number }[] || [];
  const projectsByStatus = (stats as Record<string, unknown>).projectsByStatus as { status: string; count: number }[] || [];
  const revenueByMonth = (stats as Record<string, unknown>).revenueByMonth as { month: string; revenue: number }[] || [];
  const topClients = (stats as Record<string, unknown>).topClients as { id: string; companyName: string; totalRevenue: number }[] || [];
  const recentActivities = (stats as Record<string, unknown>).recentActivity as { id: string; action: string; description: string; createdAt: string; user?: { fullName: string } }[] || [];

  const maxRevenue = revenueByMonth.length > 0 ? Math.max(1, ...revenueByMonth.map(r => r.revenue)) : 1;
  const paidInvoices = invoicesByStatus.find(invoice => invoice.status === 'Paid')?._count || 0;

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Panel de Administración</h1>
        <p className="text-muted-foreground mt-1">Vista general de todos los proyectos y clientes</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard title="Clientes" value={s?.totalClients || 0} icon={<Users className="w-5 h-5 text-emerald-600" />} />
        <DashboardCard title="Proyectos" value={s?.totalProjects || 0} icon={<FolderKanban className="w-5 h-5 text-amber-600" />} />
        <DashboardCard title="Facturas pagadas" value={paidInvoices} icon={<DollarSign className="w-5 h-5 text-emerald-600" />} description={formatCurrency(s?.totalRevenue || 0)} />
        <DashboardCard title="Entregables pendientes" value={s?.pendingDeliverables || 0} icon={<ClipboardCheck className="w-5 h-5 text-sky-600" />} />
      </div>

      {/* Quick Actions + Revenue Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend */}
        <Card className="shadow-lg shadow-black/5 dark:shadow-black/20 border-0 rounded-2xl lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              <CardTitle className="text-lg font-semibold">Tendencia de Ingresos</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {revenueByMonth.length > 0 ? (
              <div className="flex items-end gap-2 h-40">
                {revenueByMonth.map((r, i) => (
                  <div key={i} className="flex-1 h-full flex flex-col items-center gap-1">
                    <div className="flex-1 w-full flex items-end">
                      <div
                        className="w-full bg-emerald-500/80 dark:bg-emerald-400/60 rounded-t-md transition-all duration-500 min-h-[4px]"
                        style={{ height: `${Math.max((r.revenue / maxRevenue) * 100, 4)}%` }}
                        title={formatCurrency(r.revenue)}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground truncate w-full text-center">{r.month}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No hay datos de ingresos aún</p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-lg shadow-black/5 dark:shadow-black/20 border-0 rounded-2xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-600" />
              <CardTitle className="text-lg font-semibold">Acciones Rápidas</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start gap-3 rounded-xl h-11 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-700 dark:hover:text-emerald-300 hover:border-emerald-200 dark:hover:border-emerald-800/50"
              onClick={() => setAdminView('invoice-create')}
            >
              <Receipt className="w-4 h-4" />
              Crear Factura
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-3 rounded-xl h-11 hover:bg-violet-50 dark:hover:bg-violet-950/30 hover:text-violet-700 dark:hover:text-violet-300 hover:border-violet-200 dark:hover:border-violet-800/50"
              onClick={() => setAdminView('messages')}
            >
              <MessageCircle className="w-4 h-4" />
              Ver Mensajes
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-3 rounded-xl h-11 hover:bg-sky-50 dark:hover:bg-sky-950/30 hover:text-sky-700 dark:hover:text-sky-300 hover:border-sky-200 dark:hover:border-sky-800/50"
              onClick={() => window.open('/api/export?type=clients&format=csv')}
            >
              <FileDown className="w-4 h-4" />
              Exportar Datos
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects by status */}
        <Card className="shadow-lg shadow-black/5 dark:shadow-black/20 border-0 rounded-2xl">
          <CardHeader><CardTitle className="text-lg font-semibold">Proyectos por estado</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(['Discovery', 'In Progress', 'Review', 'Completed'] as const).map(status => {
                const count = projectsByStatus.find(p => p.status === status)?.count || 0;
                const total = projects.length || 1;
                const pct = (count / total) * 100;
                const colors: Record<string, string> = { 'Discovery': 'bg-amber-500', 'In Progress': 'bg-emerald-500', 'Review': 'bg-sky-500', 'Completed': 'bg-violet-500' };
                return (
                  <div key={status}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-foreground">{status}</span>
                      <span className="text-muted-foreground">{count}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${colors[status]} transition-all duration-500`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Clients */}
        <Card className="shadow-lg shadow-black/5 dark:shadow-black/20 border-0 rounded-2xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-600" />
              <CardTitle className="text-lg font-semibold">Top Clientes</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {topClients.length > 0 ? (
              <div className="space-y-3">
                {topClients.slice(0, 5).map((c, i) => (
                  <div key={c.id} className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300' : 'bg-muted text-muted-foreground'}`}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{c.companyName}</p>
                    </div>
                    <span className="text-sm font-semibold text-foreground">{formatCurrency(c.totalRevenue)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">No hay datos disponibles</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Invoices */}
      <Card className="shadow-lg shadow-black/5 dark:shadow-black/20 border-0 rounded-2xl">
        <CardHeader><CardTitle className="text-lg font-semibold">Facturas recientes</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {invoices.slice(0, 5).map(inv => (
              <div key={inv.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-foreground">{inv.invoiceNumber}</p>
                  <p className="text-xs text-muted-foreground">{inv.client?.companyName}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">{formatCurrency(inv.totalAmount)}</p>
                  <StatusBadge status={inv.status} type="invoice" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      {recentActivities.length > 0 && (
        <Card className="shadow-lg shadow-black/5 dark:shadow-black/20 border-0 rounded-2xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ActivityIcon className="w-5 h-5 text-emerald-600" />
              <CardTitle className="text-lg font-semibold">Actividad Reciente</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.slice(0, 5).map(a => (
                <div key={a.id} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{a.description}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{a.user?.fullName} &middot; {timeAgo(a.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {s?.overdueInvoices > 0 && (
        <Card className="border-rose-200 dark:border-rose-800/50 bg-rose-50/50 dark:bg-rose-950/20 rounded-2xl">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0" />
            <p className="text-sm text-rose-800 dark:text-rose-300">Tienes <span className="font-bold">{s.overdueInvoices}</span> factura{s.overdueInvoices !== 1 ? 's' : ''} vencida{s.overdueInvoices !== 1 ? 's' : ''} que requieren atención.</p>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}

// ============ ADMIN: KANBAN VIEW ============
function AdminKanbanView() {
  const { projects, setProjects } = usePortalStore();

  const handleUpdateProject = useCallback(async () => {
    try {
      const updatedProjects = await api('/api/projects');
      setProjects(updatedProjects);
      toast.success('Estado del proyecto actualizado');
    } catch {
      toast.error('Error al actualizar el proyecto');
    }
  }, [setProjects]);

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Kanban</h1>
        <p className="text-muted-foreground mt-1">Arrastra y suelta para cambiar el estado de los proyectos</p>
      </div>
      <KanbanBoard projects={projects} onUpdateProject={handleUpdateProject} />
    </motion.div>
  );
}

// ============ ADMIN: HEALTH ANALYTICS VIEW ============
function AdminHealthView() {
  const { clients } = usePortalStore();
  const [analytics, setAnalytics] = useState<{ revenueByMonth: { month: string; revenue: number }[]; projectsByStatus: { status: string; count: number; fill: string }[]; clientHealthDistribution: { range: string; count: number }[]; deliverableCompletionRate: number } | null>(null);
  const [activities, setActivities] = useState<Array<{ id: string; action: string; description: string; createdAt: string; user?: { fullName: string } }>>([]);

  useEffect(() => {
    api('/api/analytics').then(setAnalytics).catch(() => {});
    api('/api/activities?limit=30').then(setActivities).catch(() => {});
  }, []);

  const statusColors: Record<string, string> = { 'Discovery': '#f59e0b', 'In Progress': '#059669', 'Review': '#0ea5e9', 'Completed': '#7c3aed' };

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics & Salud del Cliente</h1>
        <p className="text-muted-foreground mt-1">Métricas en tiempo real de tu cartera de clientes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {analytics && analytics.revenueByMonth.length > 0 && (
          <RevenueChart data={analytics.revenueByMonth} />
        )}
        {analytics && analytics.projectsByStatus.length > 0 && (
          <ProjectStatusChart data={analytics.projectsByStatus.map(p => ({ ...p, fill: statusColors[p.status] || '#94a3b8' }))} />
        )}
      </div>

      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <DashboardCard title="Tasa Complet. Entregables" value={`${analytics.deliverableCompletionRate}%`} icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />} />
          <DashboardCard title="Clientes Activos" value={clients.length} icon={<Users className="w-5 h-5 text-amber-600" />} />
          <DashboardCard title="Salud Promedio" value={clients.length > 0 ? Math.round(clients.reduce((sum, client) => sum + (client.healthScore ?? 0), 0) / clients.length) : 0} icon={<Heart className="w-5 h-5 text-rose-600" />} />
        </div>
      )}

      <Card className="shadow-lg shadow-black/5 dark:shadow-black/20 border-0 rounded-2xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500" />
            <CardTitle className="text-lg font-semibold">Salud de Clientes</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ClientHealthTable clients={clients.map(c => ({
            id: c.id,
            companyName: c.companyName,
            healthScore: c.healthScore ?? 85,
            churnRisk: c.churnRisk ?? 0,
            totalRevenue: c.totalRevenue ?? 0,
            _count: c._count,
          }))} />
        </CardContent>
      </Card>

      {activities.length > 0 && (
        <Card className="shadow-lg shadow-black/5 dark:shadow-black/20 border-0 rounded-2xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ActivityIcon className="w-5 h-5 text-emerald-600" />
              <CardTitle className="text-lg font-semibold">Actividad Reciente</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ActivityFeed activities={activities} />
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}

// ============ ADMIN: AI INSIGHTS VIEW ============
function AdminAIView() {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">IA Insights</h1>
        <p className="text-muted-foreground mt-1">Análisis inteligente de tu negocio generado por IA</p>
      </div>
      <AIInsightsPanel />
    </motion.div>
  );
}

// ============ ADMIN: SETTINGS VIEW ============
function AdminSettingsView() {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configuración</h1>
        <p className="text-muted-foreground mt-1">Personaliza tu experiencia en ClientPortal Pro</p>
      </div>
      <SettingsPanel />
    </motion.div>
  );
}

// ============ APP NAVIGATOR ============
function AppNavigator() {
  const { user, clientView, adminView, sidebarOpen, toggleSidebar, logout, stats } = usePortalStore();
  const isAdmin = user?.role === 'admin';
  const setAdminView = usePortalStore(s => s.setAdminView);
  const setClientView = usePortalStore(s => s.setClientView);

  const renderContent = () => {
    if (isAdmin) {
      switch (adminView) {
        case 'dashboard': return <AdminDashboardView />;
        case 'clients': return <AdminClientsView />;
        case 'client-detail': return <AdminClientDetailView />;
        case 'projects': return <ProjectsListView isAdmin />;
        case 'project-detail': return <ProjectDetail projectId={usePortalStore.getState().selectedProjectId || ''} isClient={false} onBack={() => setAdminView('projects')} />;
        case 'deliverables': return <AdminDeliverablesView />;
        case 'invoices': return <InvoicesListView isAdmin />;
        case 'invoice-create': return <AdminCreateInvoiceView />;
        case 'invoice-detail': return <InvoiceDetail invoiceId={usePortalStore.getState().selectedInvoiceId || ''} isClient={false} onBack={() => setAdminView('invoices')} />;
        case 'messages': return <MessagesView />;
        case 'analytics': return <AdminHealthView />;
        case 'ai-insights': return <AdminAIView />;
        case 'settings': return <AdminSettingsView />;
        case 'kanban': return <AdminKanbanView />;
        case 'audio-lab': return <AudioLab />;
        default: return <AdminDashboardView />;
      }
    } else {
      switch (clientView) {
        case 'dashboard': return <ClientDashboardView />;
        case 'projects': return <ProjectsListView isAdmin={false} />;
        case 'project-detail': return <ProjectDetail projectId={usePortalStore.getState().selectedProjectId || ''} isClient={true} onBack={() => setClientView('projects')} />;
        case 'invoices': return <InvoicesListView isAdmin={false} />;
        case 'invoice-detail': return <InvoiceDetail invoiceId={usePortalStore.getState().selectedInvoiceId || ''} isClient={true} onBack={() => setClientView('invoices')} />;
        case 'messages': return <MessagesView />;
        case 'audio-lab': return <AudioLab />;
        default: return <ClientDashboardView />;
      }
    }
  };

  const sidebarNavItems = isAdmin
    ? [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
        { id: 'clients', label: 'Clientes', icon: <Users className="w-5 h-5" /> },
        { id: 'projects', label: 'Proyectos', icon: <FolderKanban className="w-5 h-5" /> },
        { id: 'kanban', label: 'Kanban', icon: <Kanban className="w-5 h-5" /> },
        { id: 'deliverables', label: 'Entregables', icon: <ClipboardCheck className="w-5 h-5" /> },
        { id: 'invoices', label: 'Facturas', icon: <Receipt className="w-5 h-5" /> },
        { id: 'messages', label: 'Mensajes', icon: <MessageSquare className="w-5 h-5" /> },
        { id: 'analytics', label: 'Analytics', icon: <TrendingUp className="w-5 h-5" /> },
        { id: 'ai-insights', label: 'IA Insights', icon: <Brain className="w-5 h-5" /> },
        { id: 'audio-lab', label: 'Audio Lab', icon: <AudioLines className="w-5 h-5" /> },
        { id: 'settings', label: 'Ajustes', icon: <Settings className="w-5 h-5" /> },
      ]
    : [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
        { id: 'projects', label: 'Proyectos', icon: <FolderKanban className="w-5 h-5" /> },
        { id: 'invoices', label: 'Facturas', icon: <Receipt className="w-5 h-5" /> },
        { id: 'messages', label: 'Mensajes', icon: <MessageSquare className="w-5 h-5" /> },
        { id: 'audio-lab', label: 'Audio Lab', icon: <AudioLines className="w-5 h-5" /> },
        { id: 'settings', label: 'Ajustes', icon: <Settings className="w-5 h-5" /> },
      ];

  const activeView = isAdmin ? adminView : clientView;
  const handleNav = (id: string) => {
    if (isAdmin) setAdminView(id as typeof adminView);
    else setClientView(id as typeof clientView);
    if (window.innerWidth < 768) toggleSidebar();
  };

  const unreadCount = (stats as Record<string, number>)?.unreadMessages || 0;

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-40 md:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col transform transition-transform duration-300 ease-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        {/* Brand */}
        <div className="px-5 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-foreground">ClientPortal <span className="text-emerald-500">Pro</span></span>
          </div>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleSidebar}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <Separator />

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {sidebarNavItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                activeView === item.id
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 shadow-sm'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              }`
              }
            >
              <span className={activeView === item.id ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}>{item.icon}</span>
              {item.label}
              {item.id === 'messages' && unreadCount > 0 && (
                <span className="ml-auto bg-rose-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        <Separator />

        {/* Keyboard shortcut hint */}
        <div className="px-5 py-2">
          <button
            onClick={() => {}}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground/60 hover:text-muted-foreground hover:bg-muted/50 transition-colors"
          >
            <Command className="w-3.5 h-3.5" />
            <span>Buscar</span>
            <kbd className="ml-auto bg-muted/80 dark:bg-muted/30 border border-border/50 rounded px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
          </button>
        </div>

        <Separator />

        {/* User info */}
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className={`${isAdmin ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300' : 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'} font-semibold`}>
                {(user?.fullName || 'U').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-foreground">{user?.fullName}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.company}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full justify-start text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" /> Cerrar sesión
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border px-6 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleSidebar}>
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <NotificationBell />
            {isAdmin && (
              <Badge variant="secondary" className="bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-medium">
                <Shield className="w-3 h-3 mr-1" /> Admin
              </Badge>
            )}
          </div>
        </header>

        {/* Page content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {renderContent()}
          </AnimatePresence>
        </div>
      </main>

      {/* Command Palette */}
      <CommandPalette />
    </div>
  );
}

// ============ MAIN PAGE ============
export default function HomePage() {
  const { token, user, setUser, setToken, initSocket, setClients, setProjects, setInvoices, setMessages, setStats, logout } = usePortalStore();
  const [initializing, setInitializing] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const restore = async () => {
      const savedToken = localStorage.getItem('portal_token');
      if (!savedToken) {
        setInitializing(false);
        return;
      }
      try {
        const userData = await api('/api/auth/me');
        if (userData) {
          setToken(savedToken);
          setUser(userData);
          initSocket(userData.id);
        }
      } catch {
        logout();
      } finally {
        setInitializing(false);
      }
    };
    restore();
  }, []);

  // Fetch data when user is set
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const [statsData] = await Promise.all([
          api('/api/dashboard'),
        ]);
        setStats(statsData);
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    };
    fetchData();
  }, [user]);

  // Fetch contextual data based on view
  useEffect(() => {
    if (!user) return;

    const isAdmin = user.role === 'admin';
    const fetchCtx = async () => {
      try {
        if (isAdmin) {
          const [c, p, inv] = await Promise.all([
            api('/api/clients'),
            api('/api/projects'),
            api('/api/invoices'),
          ]);
          setClients(c);
          setProjects(p);
          setInvoices(inv);
        } else {
          const [p, inv, statsData] = await Promise.all([
            api('/api/projects'),
            api('/api/invoices'),
            api('/api/stats'),
          ]);
          setProjects(p);
          setInvoices(inv);
          setStats(statsData);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchCtx();
  }, [user?.id]);

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <p className="text-muted-foreground text-sm">Cargando portal...</p>
        </div>
      </div>
    );
  }

  if (!user || !token) return <AuthView />;
  return <AppNavigator />;
}
