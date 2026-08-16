---
Task ID: components-creation
Agent: Main Agent
Task: Create NotificationBell, AIInsightsPanel, and SettingsPanel components

Work Log:
- Read worklog.md and store.ts to understand project structure, data types, and API patterns
- Analyzed existing components (DashboardCard, ActivityFeed) to match design language
- Confirmed next-themes is installed but not yet wired up; created ThemeProvider wrapper and added it to layout.tsx
- Created 3 components + 1 supporting file:
  1. `NotificationBell.tsx` - Bell icon with unread badge, dropdown panel with notification list, mark-all-read, useClickOutside, AnimatePresence
  2. `AIInsightsPanel.tsx` - AI insights card with skeleton loading, gradient border, refresh button, insight bullets, generated timestamp
  3. `SettingsPanel.tsx` - Settings card with Perfil (form fields), Preferencias (theme toggle via next-themes), Notificaciones (switch), save with toast
  4. `theme-provider.tsx` - Simple ThemeProvider wrapper for next-themes (added to layout.tsx)
- Fixed lint errors: avoided `setState` in `useEffect` by using `typeof window` + `theme !== undefined` for hydration safety
- All lint checks pass cleanly

Stage Summary:
- 3 new components created following emerald/amber design language
- All use 'use client', framer-motion, shadcn/ui, lucide-react
- Responsive design, TypeScript types, proper animations
- ThemeProvider added to layout.tsx for next-themes support
