import { motion } from "framer-motion";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type GlowPanelProps = {
  children: ReactNode;
  className?: string;
  accent?: boolean;
  delay?: number;
};

export function GlowPanel({ children, className, accent, delay = 0 }: GlowPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn(accent ? "panel-glow-accent" : "panel-glow", className)}
    >
      {children}
    </motion.div>
  );
}
