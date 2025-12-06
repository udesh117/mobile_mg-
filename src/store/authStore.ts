import { create } from 'zustand';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/config/firebase';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  checkAuthState: () => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set, get) => {
  // Set up auth state listener with error handling
  let unsubscribe: (() => void) | null = null;
  let timeoutId: NodeJS.Timeout | null = null;
  
  try {
    unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        // Clear timeout if auth state resolves
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        set({ user: user || null, isLoading: false });
      },
      (error) => {
        // Handle auth errors
        console.error('Auth state change error:', error);
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        set({ user: null, isLoading: false });
      }
    );
  } catch (error) {
    console.error('Error setting up auth listener:', error);
    // Set loading to false even if listener setup fails
    set({ user: null, isLoading: false });
  }

  // Fallback timeout - if auth state doesn't resolve in 2 seconds, stop loading
  timeoutId = setTimeout(() => {
    const currentState = get();
    if (currentState.isLoading) {
      console.warn('Auth state check timed out, proceeding with current user');
      set({ isLoading: false });
    }
    timeoutId = null;
  }, 2000);

  return {
    user: auth.currentUser || null,
    isLoading: true,
    checkAuthState: () => {
      set({ isLoading: true, user: auth.currentUser || null });
    },
    setUser: (user) => {
      set({ user, isLoading: false });
    },
    setLoading: (loading) => set({ isLoading: loading }),
  };
});
