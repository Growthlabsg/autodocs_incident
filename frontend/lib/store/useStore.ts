// lib/store/useStore.ts
// Global State Management with Zustand

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      login: (user, accessToken, refreshToken) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        set({ user, accessToken, refreshToken, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
    }),
    {
      name: 'auth-storage',
    }
  )
);

interface UIState {
  sidebarCollapsed: boolean;
  darkMode: boolean;
  toggleSidebar: () => void;
  toggleDarkMode: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      darkMode: true,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
    }),
    {
      name: 'ui-storage',
    }
  )
);

interface Incident {
  id: string;
  incidentNumber: string;
  title: string;
  severity: string;
  status: string;
  createdAt: string;
}

interface IncidentState {
  incidents: Incident[];
  selectedIncident: Incident | null;
  setIncidents: (incidents: Incident[]) => void;
  setSelectedIncident: (incident: Incident | null) => void;
  addIncident: (incident: Incident) => void;
  updateIncident: (id: string, data: Partial<Incident>) => void;
  deleteIncident: (id: string) => void;
}

export const useIncidentStore = create<IncidentState>((set) => ({
  incidents: [],
  selectedIncident: null,
  setIncidents: (incidents) => set({ incidents }),
  setSelectedIncident: (incident) => set({ selectedIncident: incident }),
  addIncident: (incident) =>
    set((state) => ({ incidents: [incident, ...state.incidents] })),
  updateIncident: (id, data) =>
    set((state) => ({
      incidents: state.incidents.map((inc) =>
        inc.id === id ? { ...inc, ...data } : inc
      ),
    })),
  deleteIncident: (id) =>
    set((state) => ({
      incidents: state.incidents.filter((inc) => inc.id !== id),
    })),
}));
