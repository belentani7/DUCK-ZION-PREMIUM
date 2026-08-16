// BELENTANI OMEGA ULTRA
// Autoría: Pedro Belentani
// Fecha: 2026-08-14
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import {
  User,
  Settings2,
  Bell,
  Save,
  Monitor,
  Sun,
  Moon,
  Mail,
  Building2,
  Phone,
  Loader2,
} from 'lucide-react';
import { usePortalStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ============ THEME OPTIONS ============
const themeOptions = [
  { value: 'system', label: 'Sistema', icon: Monitor },
  { value: 'light', label: 'Claro', icon: Sun },
  { value: 'dark', label: 'Oscuro', icon: Moon },
] as const;

// ============ SECTION HEADER ============
function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>
    </div>
  );
}

// ============ COMPONENT ============
export function SettingsPanel() {
  const user = usePortalStore((s) => s.user);
  const { theme, setTheme } = useTheme();

  // Form state — derive from user at render time
  const [fullName, setFullName] = useState(() => user?.fullName || '');
  const [email, setEmail] = useState(() => user?.email || '');
  const [company, setCompany] = useState(() => user?.company || '');
  const [phone, setPhone] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [saving, setSaving] = useState(false);

  // next-themes is only available on client — theme being defined indicates hydration is done
  const mounted = typeof window !== 'undefined' && theme !== undefined;

  const handleSave = async () => {
    setSaving(true);

    // Simulate save with a short delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Update store user locally
    const store = usePortalStore.getState();
    if (store.setUser) {
      store.setUser({
        ...store.user!,
        fullName,
        email,
        company,
      });
    }

    setSaving(false);
    toast.success('Configuración guardada', {
      description: 'Tus preferencias han sido actualizadas correctamente.',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <Card className="shadow-lg shadow-black/5 border-0 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600/5 to-amber-500/5 px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/25">
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Configuración</h2>
              <p className="text-xs text-slate-500">Gestiona tu perfil y preferencias</p>
            </div>
          </div>
        </div>

        <CardContent className="p-6 space-y-0">
          {/* ====== PERFIL SECTION ====== */}
          <section>
            <SectionHeader
              icon={User}
              title="Perfil"
              description="Información personal y de contacto"
            />

            <div className="mt-4 flex items-center gap-4 mb-5">
              <Avatar className="w-14 h-14 border-2 border-emerald-200">
                <AvatarFallback className="bg-emerald-100 text-emerald-700 text-lg font-bold">
                  {(fullName || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold text-slate-900">{fullName || 'Tu nombre'}</p>
                <p className="text-xs text-slate-500">{user?.role === 'admin' ? 'Administrador' : 'Cliente'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-xs font-medium text-slate-600">
                  <User className="w-3 h-3 inline mr-1" />
                  Nombre completo
                </Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Tu nombre completo"
                  className="h-10 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium text-slate-600">
                  <Mail className="w-3 h-3 inline mr-1" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="h-10 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="company" className="text-xs font-medium text-slate-600">
                  <Building2 className="w-3 h-3 inline mr-1" />
                  Empresa
                </Label>
                <Input
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Nombre de empresa"
                  className="h-10 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-medium text-slate-600">
                  <Phone className="w-3 h-3 inline mr-1" />
                  Teléfono
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+34 600 000 000"
                  className="h-10 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                />
              </div>
            </div>
          </section>

          <Separator className="my-6" />

          {/* ====== PREFERENCIAS SECTION ====== */}
          <section>
            <SectionHeader
              icon={Monitor}
              title="Preferencias"
              description="Personaliza la apariencia de tu portal"
            />

            <div className="mt-4">
              <p className="text-xs font-medium text-slate-600 mb-3">Tema visual</p>
              <div className="grid grid-cols-3 gap-3">
                {mounted
                  ? themeOptions.map((opt) => {
                      const Icon = opt.icon;
                      const isActive = theme === opt.value;

                      return (
                        <motion.button
                          key={opt.value}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setTheme(opt.value)}
                          className={cn(
                            'flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200',
                            isActive
                              ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                          )}
                        >
                          <div
                            className={cn(
                              'flex items-center justify-center w-9 h-9 rounded-lg transition-colors',
                              isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'
                            )}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <span
                            className={cn(
                              'text-xs font-medium transition-colors',
                              isActive ? 'text-emerald-700' : 'text-slate-600'
                            )}
                          >
                            {opt.label}
                          </span>
                          {isActive && (
                            <motion.div
                              layoutId="theme-indicator"
                              className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            />
                          )}
                        </motion.button>
                      );
                    })
                  : // Skeleton for hydration
                    [1, 2, 3].map((i) => (
                      <div key={i} className="flex flex-col items-center gap-2 p-3 rounded-xl border-2 border-slate-200">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 animate-pulse" />
                        <div className="h-3 w-10 bg-slate-100 rounded animate-pulse" />
                      </div>
                    ))}
              </div>
            </div>
          </section>

          <Separator className="my-6" />

          {/* ====== NOTIFICACIONES SECTION ====== */}
          <section>
            <SectionHeader
              icon={Bell}
              title="Notificaciones"
              description="Controla cómo recibes las alertas"
            />

            <div className="mt-4 space-y-4">
              {/* Main toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-100 text-emerald-600">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Notificaciones habilitadas</p>
                    <p className="text-xs text-slate-500">Recibe alertas de proyectos y mensajes</p>
                  </div>
                </div>
                <Switch
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                  className="data-[state=checked]:bg-emerald-600"
                />
              </div>

              {/* Subtle disabled state */}
              {!notificationsEnabled && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100"
                >
                  Las notificaciones están desactivadas. No recibirás alertas de cambios en proyectos, facturas o mensajes.
                </motion.p>
              )}
            </div>
          </section>

          <Separator className="my-6" />

          {/* ====== SAVE BUTTON ====== */}
          <div className="flex justify-end pt-1">
            <motion.div whileTap={{ scale: 0.97 }}>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-700 text-white h-10 px-6 rounded-xl font-semibold shadow-md shadow-emerald-500/20 transition-all duration-200"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar cambios
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
