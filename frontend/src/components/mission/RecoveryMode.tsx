import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GlowPanel } from "@/components/ui/glow-panel";
import type { RecoveryPlanResponse } from "@/types/api";

type RecoveryModeProps = {
  visible: boolean;
  confidenceDrop?: number;
  plan?: RecoveryPlanResponse;
  onGenerate: () => void;
  onApply: () => void;
  isGenerating?: boolean;
  isApplying?: boolean;
};

export function RecoveryMode({
  visible,
  confidenceDrop = 9,
  plan,
  onGenerate,
  onApply,
  isGenerating,
  isApplying,
}: RecoveryModeProps) {
  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <GlowPanel className="border-warning/30 bg-warning/5 p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-warning/20">
                <RefreshCw className="h-5 w-5 text-warning" />
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">Mission delayed</h3>
                  <p className="mt-1 text-muted">
                    Confidence dropped ~{confidenceDrop}%. I&apos;ve analyzed recovery options.
                  </p>
                </div>

                {!plan ? (
                  <Button variant="secondary" onClick={onGenerate} disabled={isGenerating}>
                    {isGenerating ? "Rebuilding schedule..." : "Generate recovery plan"}
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm">{plan.plan.recovery_message}</p>

                    <div className="grid gap-4 md:grid-cols-2">
                      <ScheduleCard title="Before" items={plan.plan.at_risk_items} muted />
                      <ScheduleCard
                        title="After"
                        items={plan.plan.new_daily_plan.task_titles}
                        accent
                      />
                    </div>

                    <p className="text-sm text-muted">
                      Estimated recovery: 2 days · New confidence: {plan.plan.new_confidence_score}%
                    </p>

                    <Button onClick={onApply} disabled={isApplying}>
                      {isApplying ? "Applying..." : "Accept Recovery Plan"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </GlowPanel>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function ScheduleCard({
  title,
  items,
  muted,
  accent,
}: {
  title: string;
  items: string[];
  muted?: boolean;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        accent ? "border-accent/30 bg-accent/5" : "border-border bg-background/50 opacity-80"
      }`}
    >
      <p className="text-xs font-medium uppercase tracking-wider text-muted">{title}</p>
      <ul className="mt-2 space-y-1">
        {items.length ? (
          items.map((item) => (
            <li key={item} className={`text-sm ${muted ? "text-muted line-through" : ""}`}>
              {item}
            </li>
          ))
        ) : (
          <li className="text-sm text-muted">—</li>
        )}
      </ul>
    </div>
  );
}
