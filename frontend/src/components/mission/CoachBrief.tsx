import { motion } from "framer-motion";
import { Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GlowPanel } from "@/components/ui/glow-panel";
import type { CoachMessageResponse } from "@/types/api";

type CoachBriefProps = {
  coach?: CoachMessageResponse;
  userName?: string | null;
  isLoading?: boolean;
  onStartFocus?: () => void;
};

export function CoachBrief({ coach, userName, isLoading, onStartFocus }: CoachBriefProps) {
  const firstName = userName?.split(" ")[0] ?? "there";

  if (isLoading) {
    return (
      <GlowPanel className="p-8">
        <div className="h-24 animate-pulse rounded-xl bg-border/30" />
      </GlowPanel>
    );
  }

  if (!coach) return null;

  const lines = coach.message.split(/[.!?]/).filter(Boolean);
  const headline = lines[0] ? `${lines[0]}.` : coach.message;
  const punch =
    coach.recommended_action.length < 120
      ? coach.recommended_action
      : `Completing your next action increases mission success.`;

  return (
    <GlowPanel accent className="p-8 md:p-10">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <p className="text-sm text-muted">Good {getGreeting()}, {firstName}.</p>
        <p className="text-xl font-medium leading-relaxed md:text-2xl">{headline}</p>
        <p className="text-muted leading-relaxed">{punch}</p>
        <p className="text-sm text-accent/80">{coach.risk_insight}</p>

        <Button size="lg" onClick={onStartFocus} className="mt-2">
          <Play className="h-4 w-4" />
          Start Focus Session
        </Button>
      </motion.div>
    </GlowPanel>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
