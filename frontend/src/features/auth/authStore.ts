import { create } from "zustand";

import { getFirebaseAuth, getIdToken, signInWithGoogle, signOutUser, subscribeToAuth } from "./firebase";

type AuthUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
};

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
  initialize: () => () => void;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<string | null>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  loading: false,
  initialized: false,
  error: null,

  initialize: () => {
    const unsubscribe = subscribeToAuth(async (firebaseUser) => {
      if (!firebaseUser) {
        set({ user: null, token: null, loading: false, initialized: true });
        return;
      }

      const token = await getIdToken(firebaseUser);
      set({
        user: {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        },
        token,
        loading: false,
        initialized: true,
        error: null,
      });
    });

    return unsubscribe;
  },

  loginWithGoogle: async () => {
    set({ loading: true, error: null });
    try {
      const user = await signInWithGoogle();
      const token = await getIdToken(user);
      set({
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        },
        token,
        loading: false,
      });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : "Sign in failed",
      });
      throw error;
    }
  },

  logout: async () => {
    await signOutUser();
    set({ user: null, token: null });
  },

  refreshToken: async () => {
    const current = getFirebaseAuth().currentUser;
    if (!current) return null;
    const token = await getIdToken(current);
    set({ token });
    return token;
  },
}));
