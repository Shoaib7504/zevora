import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Slices definitions for scalability
interface UISlice {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

interface AuthSlice {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

// Combined App Store State
type AppStoreState = UISlice & AuthSlice;

export const useAppStore = create<AppStoreState>()(
  devtools(
    persist(
      (set) => ({
        // UI Slice Initial State & Actions
        sidebarOpen: false,
        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen }), false, 'ui/toggleSidebar'),
        setSidebarOpen: (open) => set({ sidebarOpen: open }, false, 'ui/setSidebarOpen'),

        // Auth Slice Initial State & Actions
        user: null,
        isAuthenticated: false,
        setUser: (user) => set({ user, isAuthenticated: !!user }, false, 'auth/setUser'),
        logout: () => {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
          }
          set({ user: null, isAuthenticated: false }, false, 'auth/logout');
        },
      }),
      {
        name: 'saas-app-storage', // Key for LocalStorage
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }), // Persist only auth slice
      }
    ),
    { name: 'SaaSAppStore' }
  )
);

export default useAppStore;
