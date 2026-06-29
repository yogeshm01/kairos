import { motion } from "framer-motion";
import { Chrome, Radar } from "lucide-react";
import { Navigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { GlowPanel } from "@/components/ui/glow-panel";
import { Spinner } from "@/components/ui/spinner";
import { isFirebaseConfigured } from "@/features/auth/firebase";
import { useAuthStore } from "@/features/auth/authStore";

export function LoginPage() {
  const { user, loading, error, loginWithGoogle, initialized } = useAuthStore();
  const firebaseReady = isFirebaseConfigured();

  if (initialized && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md space-y-10 text-center"
      >
        <div className="space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10 shadow-glow-sm">
            <Radar className="h-7 w-7 text-accent" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">Mission Control</h1>
          <p className="text-muted leading-relaxed">
            An autonomous AI execution system.
            <br />
            Not a to-do list.
          </p>
        </div>

        <GlowPanel className="space-y-5 p-8 text-left">
          {!firebaseReady ? (
            <p className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm text-warning">
              Add Firebase config to <code className="text-xs">.env</code>
            </p>
          ) : null}

          {error ? (
            <p className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
              {error}
            </p>
          ) : null}

          <Button
            className="w-full"
            size="lg"
            disabled={!firebaseReady || loading}
            onClick={() => void loginWithGoogle()}
          >
            {loading ? <Spinner /> : <Chrome className="h-4 w-4" />}
            Continue with Google
          </Button>
        </GlowPanel>
      </motion.div>
    </div>
  );
}
