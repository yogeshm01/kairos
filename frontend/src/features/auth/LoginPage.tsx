import { motion } from "framer-motion";
import { Chrome, Radar, Sparkles } from "lucide-react";
import { Navigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { GlowPanel } from "@/components/ui/glow-panel";
import { Spinner } from "@/components/ui/spinner";
import { isFirebaseConfigured } from "@/features/auth/firebase";
import { useAuthStore } from "@/features/auth/authStore";
import { useAIProfile } from "@/hooks/useMissions";

export function LoginPage() {
  const { user, loading, error, loginWithGoogle, initialized } = useAuthStore();
  const firebaseReady = isFirebaseConfigured();
  const { data: aiProfile } = useAIProfile();

  if (initialized && user) {
    // Redirect to onboarding if AI Profile not completed
    if (!aiProfile?.onboarding_completed) {
      return <Navigate to="/onboarding" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-[#050608] flex items-center justify-center px-6 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(110,231,255,0.08),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_100%_100%,rgba(52,211,153,0.04),transparent)]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md space-y-10 text-center relative z-10"
      >
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30"
          >
            <Radar className="h-8 w-8 text-cyan-400" />
          </motion.div>
          <h1 className="text-4xl font-bold tracking-tight">
            <span className="text-gradient">Mission Control</span>
          </h1>
          <p className="text-gray-400 leading-relaxed text-lg">
            An autonomous AI execution system.
            <br />
            Not a to-do list.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlowPanel className="panel-glow-accent space-y-6 p-8 text-left rounded-3xl">
            {!firebaseReady ? (
              <p className="rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm text-warning">
                Add Firebase config to <code className="text-xs">.env</code>
              </p>
            ) : null}

            {error ? (
              <p className="rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
                {error}
              </p>
            ) : null}

            <Button
              className="w-full h-14 text-base bg-gradient-to-r from-cyan-500 to-emerald-500 hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-300"
              size="lg"
              disabled={!firebaseReady || loading}
              onClick={() => void loginWithGoogle()}
            >
              {loading ? <Spinner /> : <Chrome className="h-5 w-5" />}
              Continue with Google
            </Button>

            <p className="text-center text-sm text-gray-500">
              By continuing, you agree to our Terms of Service
            </p>
          </GlowPanel>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-2 text-sm text-gray-500"
        >
          <Sparkles className="h-4 w-4 text-cyan-400" />
          <span>AI-Powered Productivity</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
