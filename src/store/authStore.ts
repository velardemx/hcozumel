import { create } from 'zustand';
import { User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { firebaseService } from '../services/firebase';

type UserRole = 'superadmin' | 'president' | 'admin' | 'worker' | null;

interface AuthState {
  user: User | null;
  userRole: UserRole;
  isInitialized: boolean;
  setUser: (user: User | null) => void;
  setUserRole: (role: UserRole) => void;
  setInitialized: (initialized: boolean) => void;
  clearAuth: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  userRole: null,
  isInitialized: false,
  
  setUser: (user) => set({ user }),
  setUserRole: (role) => set({ userRole: role }),
  setInitialized: (initialized) => set({ isInitialized: initialized }),
  
  clearAuth: () => set({
    user: null,
    userRole: null,
    isInitialized: true
  }),

  initialize: () => {
    auth.onAuthStateChanged(async (user) => {
      try {
        if (user) {
          const userData = await firebaseService.getDocument('users', user.uid);
          set({
            user,
            userRole: userData?.role || null,
            isInitialized: true
          });
        } else {
          const hasSuperAdmin = await firebaseService.checkSuperAdminExists();
          set({
            user: null,
            userRole: null,
            isInitialized: true
          });
          
          // Handle initial setup redirect
          if (!hasSuperAdmin && window.location.pathname !== '/setup') {
            window.location.href = '/setup';
          }
        }
      } catch (error) {
        console.error('Auth state error:', error);
        set({
          user: null,
          userRole: null,
          isInitialized: true
        });
      }
    });
  }
}));