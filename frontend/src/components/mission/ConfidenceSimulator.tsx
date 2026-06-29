import { useMemo, useState } from "react";
import { motion } from "framer-motion";

import { GlowPanel } from "@/components/ui/glow-panel";
import { simulateConfidence } from "@/lib/missionIntel";

type ConfidenceSimulatorProps = {
  baseScore: number;
  currentHours: number;
  daysRemaining: number;
  completionRate: number;
};

const HOUR_OPTIONS = [1, 1.5, 2, 2.5, 3, 4, 5, 6];

export function ConfidenceSimulator({
  baseScore,
  currentHours,
  daysRemaining,
  completionRate,
}: ConfidenceSimulatorProps) {
  const [hours, setHours] = useState(currentHours);

  const projected = useMemo(
    () => simulateConfidence(baseScore, hours, daysRemaining, completionRate),
    [baseScore, hours, daysRemaining, completionRate],
  );

  return (
    <GlowPanel className="p-6 md:p-8">
      <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-muted">
        Confidence Simulator
      </h3>
      <p className="mt-2 text-sm text-muted">If I dedicate more time daily...</p>

      <div className="mt-8">
        <input
          type="range"
          min={0}
          max={HOUR_OPTIONS.length - 1}
          value={HOUR_OPTIONS.indexOf(hours) >= 0 ? HOUR_OPTIONS.indexOf(hours) : 2}
          onChange={(e) => setHours(HOUR_OPTIONS[Number(e.target.value)] ?? 2)}
          className="w-full accent-accent"
        />
        <div className="mt-2 flex justify-between text-xs text-muted">
          {HOUR_OPTIONS.map((h) => (
            <span key={h}>{h}h</span>
          ))}
        </div>
      </div>

      <motion.div
        key={projected}
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="mt-8 text-center"
      >
        <p className="text-sm text-muted">At {hours} hours/day</p>
        <p className="mt-2 text-5xl font-semibold tabular-nums text-gradient">{projected}%</p>
        <p className="mt-1 text-sm text-muted">estimated success probability</p>
      </motion.div>

      <div className="mt-6 grid grid-cols-4 gap-2">
        {HOUR_OPTIONS.slice(0, 4).map((h) => {
          const score = simulateConfidence(baseScore, h, daysRemaining, completionRate);
          return (
            <button
              key={h}
              type="button"
              onClick={() => setHours(h)}
              className={`rounded-lg border px-2 py-2 text-center text-xs transition ${
                hours === h
                  ? "border-accent/40 bg-accent/10 text-accent"
                  : "border-border text-muted hover:border-border/80"
              }`}
            >
              <div className="font-medium">{h}h</div>
              <div className="mt-0.5 tabular-nums">{score}%</div>
            </button>
          );
        })}
      </div>
    </GlowPanel>
  );
}
