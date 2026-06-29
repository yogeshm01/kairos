import { motion } from "framer-motion";
import {
  Activity,
  Brain,
  Calendar,
  Shield,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";

import { GlowPanel } from "@/components/ui/glow-panel";
import type { ActivityEvent } from "@/lib/missionIntel";

const iconMap = {
  analysis: Brain,
  schedule: Calendar,
  risk: Shield,
  confidence: TrendingUp,
  recovery: Zap,
  completion: Sparkles,
};

type AiActivityFeedProps = {
  events: ActivityEvent[];
};

export function AiActivityFeed({ events }: AiActivityFeedProps) {
  return (
    <GlowPanel className="p-6 md:p-8">
      <div className="mb-6 flex items-center gap-2">
        <Activity className="h-4 w-4 text-accent" />
        <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-muted">AI Activity</h3>
        <span className="ml-auto flex items-center gap-1.5 text-xs text-success">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
          Live
        </span>
      </div>

      <div className="relative space-y-0">
        <div className="absolute bottom-2 left-[11px] top-2 w-px bg-border" />
        {events.map((event, i) => {
          const Icon = iconMap[event.type];
          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="relative flex gap-4 pb-5 last:pb-0"
            >
              <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-surface-elevated">
                <Icon className="h-3 w-3 text-accent" />
              </div>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-sm font-medium">{event.title}</p>
                {event.detail ? (
                  <p className="mt-0.5 text-sm text-muted">{event.detail}</p>
                ) : null}
              </div>
            </motion.div>
          );
        })}
      </div>
    </GlowPanel>
  );
}
