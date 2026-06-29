import { motion } from "framer-motion";

import { GlowPanel } from "@/components/ui/glow-panel";
import type { ActivityEvent } from "@/lib/missionIntel";

type MissionReplayProps = {
  events: ActivityEvent[];
};

export function MissionReplay({ events }: MissionReplayProps) {
  return (
    <GlowPanel className="p-6 md:p-8">
      <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-muted">Mission Replay</h3>

      <div className="mt-8 flex flex-col items-center">
        {events.map((event, i) => (
          <div key={event.id} className="flex w-full max-w-md flex-col items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="w-full rounded-xl border border-border bg-surface-elevated px-4 py-3 text-center"
            >
              <p className="text-sm font-medium">{event.title}</p>
              {event.detail ? <p className="mt-1 text-xs text-muted">{event.detail}</p> : null}
            </motion.div>
            {i < events.length - 1 ? (
              <div className="py-2 text-muted">↓</div>
            ) : null}
          </div>
        ))}
      </div>
    </GlowPanel>
  );
}
