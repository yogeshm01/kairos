import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import { GlowPanel } from "@/components/ui/glow-panel";
import { Spinner } from "@/components/ui/spinner";

const ANALYSIS_STEPS = [
  "Analyzing mission...",
  "Understanding objective...",
  "Finding hidden dependencies...",
  "Estimating workload...",
  "Researching prerequisites...",
  "Building execution graph...",
  "Generating milestones...",
  "Running deadline simulation...",
  "Calculating completion probability...",
  "Creating execution strategy...",
];

type MissionAnalyzingProps = {
  active: boolean;
  onComplete?: () => void;
  apiDone: boolean;
};

export function MissionAnalyzing({ active, onComplete, apiDone }: MissionAnalyzingProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [minTimeDone, setMinTimeDone] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!active) return;

    const stepTimer = window.setInterval(() => {
      setStepIndex((prev) => (prev < ANALYSIS_STEPS.length - 1 ? prev + 1 : prev));
    }, 700);

    const minTimer = window.setTimeout(() => setMinTimeDone(true), 5500);

    return () => {
      window.clearInterval(stepTimer);
      window.clearTimeout(minTimer);
    };
  }, [active]);

  useEffect(() => {
    if (active && apiDone && minTimeDone && stepIndex >= ANALYSIS_STEPS.length - 1) {
      setReady(true);
      const t = window.setTimeout(() => onComplete?.(), 1200);
      return () => window.clearTimeout(t);
    }
  }, [active, apiDone, minTimeDone, stepIndex, onComplete]);

  if (!active) return null;

  return (
    <GlowPanel accent className="p-10 md:p-14">
      <div className="mx-auto max-w-lg space-y-10 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10">
          {ready ? (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-2xl text-success"
            >
              ✓
            </motion.span>
          ) : (
            <Sparkles className="h-8 w-8 animate-pulse-soft text-accent" />
          )}
        </div>

        <div>
          <h2 className="text-2xl font-semibold">
            {ready ? "Mission Ready" : "AI Analysis in Progress"}
          </h2>
          <p className="mt-2 text-muted">
            {ready ? "Your execution system is online." : "Building your autonomous plan..."}
          </p>
        </div>

        {!ready ? (
          <div className="space-y-3 text-left">
            {ANALYSIS_STEPS.map((step, index) => (
              <motion.div
                key={step}
                initial={{ opacity: 0.4 }}
                animate={{ opacity: index <= stepIndex ? 1 : 0.35 }}
                className="flex items-center gap-3 text-sm"
              >
                {index < stepIndex ? (
                  <span className="text-success">✓</span>
                ) : index === stepIndex ? (
                  <Spinner className="h-4 w-4" />
                ) : (
                  <span className="w-4 text-center text-muted">·</span>
                )}
                <span className={index <= stepIndex ? "text-foreground" : "text-muted"}>
                  {step}
                </span>
              </motion.div>
            ))}
          </div>
        ) : null}
      </div>
    </GlowPanel>
  );
}

export { ANALYSIS_STEPS };
