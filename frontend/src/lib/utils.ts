import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function riskColor(level: string) {
  switch (level) {
    case "low":
      return "text-success";
    case "medium":
      return "text-warning";
    case "high":
      return "text-danger";
    case "critical":
      return "text-danger";
    default:
      return "text-muted";
  }
}

export function riskBg(level: string) {
  switch (level) {
    case "low":
      return "bg-success/10 border-success/30";
    case "medium":
      return "bg-warning/10 border-warning/30";
    case "high":
      return "bg-danger/10 border-danger/30";
    case "critical":
      return "bg-danger/20 border-danger/40";
    default:
      return "bg-surface border-border";
  }
}

export function priorityLabel(priority: string) {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}
