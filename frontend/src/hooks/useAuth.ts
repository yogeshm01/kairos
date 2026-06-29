import { useEffect } from "react";

import { useAuthStore } from "@/features/auth/authStore";

export function useAuthInit() {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    const unsubscribe = initialize();
    return unsubscribe;
  }, [initialize]);
}

export function useAuthToken() {
  return useAuthStore((s) => s.token);
}

export function useAuthUser() {
  return useAuthStore((s) => s.user);
}
