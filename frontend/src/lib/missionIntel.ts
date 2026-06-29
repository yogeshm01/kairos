import type {
  DashboardTask,
  Mission,
  MissionDashboard,
  Reflection,
  WeeklyInsightsResponse,
} from "@/types/api";

export type ActivityEvent = {
  id: string;
  time: string;
  title: string;
  detail?: string;
  type: "analysis" | "schedule" | "risk" | "confidence" | "recovery" | "completion";
};

export function daysUntil(deadline: string): number {
  const end = new Date(deadline);
  const now = new Date();
  end.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 86_400_000));
}

export function formatCountdown(deadline: string): string {
  const days = daysUntil(deadline);
  if (days === 0) return "Due today";
  if (days === 1) return "1 day left";
  return `${days} days left`;
}

export function hoursPerDay(mission: Mission): number {
  const minutes = mission.available_minutes_per_day ?? 120;
  return Math.round((minutes / 60) * 10) / 10;
}

export function pickPrimaryMission(missions: Mission[]): Mission | null {
  if (!missions.length) return null;
  const active = missions.filter((m) => m.status === "active" || m.status === "at_risk");
  const pool = active.length ? active : missions;
  return [...pool].sort((a, b) => {
    const riskOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const ra = riskOrder[a.risk_level as keyof typeof riskOrder] ?? 2;
    const rb = riskOrder[b.risk_level as keyof typeof riskOrder] ?? 2;
    if (ra !== rb) return ra - rb;
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  })[0]!;
}

export function getPrimaryAction(
  dashboard: MissionDashboard,
): { title: string; taskId?: string; minutes: number; priority: string; rationale?: string } {
  const first = dashboard.todays_tasks[0];
  if (first) {
    return {
      title: first.task.title,
      taskId: first.task.id,
      minutes: first.task.estimated_minutes ?? 45,
      priority: first.task.priority,
      rationale: first.why_it_matters ?? first.task.rationale ?? undefined,
    };
  }
  return {
    title: dashboard.next_best_action,
    minutes: 45,
    priority: "high",
  };
}

export function estimateImpact(confidence: number, priority: string): number {
  const base = priority === "critical" ? 14 : priority === "high" ? 12 : priority === "medium" ? 8 : 5;
  return Math.min(18, Math.max(4, Math.round(base * (1 - confidence / 150))));
}

export function buildActivityFeed(
  dashboard: MissionDashboard,
  weekly?: WeeklyInsightsResponse,
): ActivityEvent[] {
  const events: ActivityEvent[] = [];
  const now = new Date().toISOString();

  events.push({
    id: "init",
    time: dashboard.mission.created_at,
    title: "Mission analyzed",
    detail: `Execution graph generated for "${dashboard.mission.title}"`,
    type: "analysis",
  });

  if (dashboard.progress.completed_milestones > 0) {
    events.push({
      id: "milestone",
      time: now,
      title: "Milestone progress detected",
      detail: `${dashboard.progress.completed_milestones} of ${dashboard.progress.total_milestones} milestones complete`,
      type: "completion",
    });
  }

  const overdue = dashboard.todays_tasks.filter(
    (t) => t.task.scheduled_date && new Date(t.task.scheduled_date) < new Date(),
  ).length;
  if (overdue > 0 || dashboard.deadline_risk_score > 50) {
    events.push({
      id: "risk",
      time: now,
      title: "Deadline risk evaluated",
      detail:
        overdue > 0
          ? `${overdue} overdue items — schedule may need adaptation`
          : `Risk score at ${dashboard.deadline_risk_score}/100`,
      type: "risk",
    });
  }

  if (dashboard.todays_plan) {
    events.push({
      id: "schedule",
      time: now,
      title: "Today's execution plan ready",
      detail: dashboard.todays_plan.focus,
      type: "schedule",
    });
  }

  if (dashboard.confidence_trend === "improving") {
    events.push({
      id: "confidence",
      time: now,
      title: "Confidence increased",
      detail: `Now at ${dashboard.confidence_score}% — momentum building`,
      type: "confidence",
    });
  } else if (dashboard.confidence_trend === "declining") {
    events.push({
      id: "confidence-down",
      time: now,
      title: "Confidence dropped",
      detail: "Recovery planning recommended",
      type: "recovery",
    });
  }

  if (weekly?.insights.completion_patterns[0]) {
    events.push({
      id: "weekly",
      time: now,
      title: "Weekly pattern analysis",
      detail: weekly.insights.completion_patterns[0],
      type: "analysis",
    });
  }

  return events.reverse();
}

export function buildConfidenceReasons(dashboard: MissionDashboard): string[] {
  const reasons: string[] = [];
  const { progress, confidence_trend } = dashboard;

  if (progress.completed_milestones > 0) {
    reasons.push(`Completed ${progress.completed_milestones} milestone(s)`);
  }
  if (progress.completion_rate > 0) {
    reasons.push(`${Math.round(progress.completion_rate * 100)}% of tasks done`);
  }
  if (dashboard.deadline_risk_score < 40) {
    reasons.push("Deadline risk is manageable");
  } else {
    reasons.push("Deadline pressure is elevated");
  }
  if (confidence_trend === "improving") reasons.push("Positive momentum today");
  if (confidence_trend === "declining") reasons.push("Recent slips detected");

  return reasons.slice(0, 4);
}

export function buildRiskExplanation(dashboard: MissionDashboard): {
  causes: string[];
  recovery: string;
  topMitigation: string;
} {
  const causes = dashboard.ai_suggestions.length
    ? dashboard.ai_suggestions.slice(0, 3)
    : [`${dashboard.progress.days_remaining} days until deadline`];

  if (dashboard.progress.completion_rate < 0.4 && dashboard.progress.days_remaining < 21) {
    causes.unshift("Completion pace is behind schedule");
  }

  return {
    causes,
    recovery: dashboard.deadline_risk_score > 55 ? "Recovery plan available" : "Stay on today's plan",
    topMitigation: dashboard.next_best_action,
  };
}

export function simulateConfidence(
  baseScore: number,
  hoursPerDay: number,
  daysRemaining: number,
  completionRate: number,
): number {
  const timeFactor = Math.min(hoursPerDay / 6, 1) * 35;
  const deadlineFactor = Math.min(daysRemaining / 30, 1) * 20;
  const progressFactor = completionRate * 25;
  const raw = timeFactor + deadlineFactor + progressFactor + baseScore * 0.2;
  return Math.min(98, Math.max(12, Math.round(raw)));
}

export function buildReplayEvents(
  mission: Mission,
  reflections: Reflection[],
  progress: MissionDashboard["progress"],
): ActivityEvent[] {
  const events: ActivityEvent[] = [
    {
      id: "created",
      time: mission.created_at,
      title: "Mission created",
      detail: mission.title,
      type: "analysis",
    },
    {
      id: "plan",
      time: mission.created_at,
      title: "Execution plan generated",
      detail: `${progress.total_milestones} milestones · ${progress.total_tasks} tasks`,
      type: "schedule",
    },
  ];

  if (progress.completed_tasks > 0) {
    events.push({
      id: "tasks",
      time: new Date().toISOString(),
      title: `${progress.completed_tasks} tasks completed`,
      type: "completion",
    });
  }

  if (reflections.length) {
    events.push({
      id: "reflect",
      time: reflections[0]!.reflection_date,
      title: "Schedule adapted from reflection",
      detail: reflections[0]!.ai_insight ?? "Learning from daily feedback",
      type: "recovery",
    });
  }

  if (progress.completion_rate >= 1) {
    events.push({
      id: "success",
      time: new Date().toISOString(),
      title: "Mission success",
      detail: "All objectives complete",
      type: "confidence",
    });
  }

  return events;
}

export function hasMissedWork(dashboard: MissionDashboard): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return dashboard.todays_tasks.some((t: DashboardTask) => {
    if (!t.task.scheduled_date) return false;
    const d = new Date(t.task.scheduled_date);
    d.setHours(0, 0, 0, 0);
    return d < today && t.task.status !== "completed" && t.task.status !== "skipped";
  });
}
