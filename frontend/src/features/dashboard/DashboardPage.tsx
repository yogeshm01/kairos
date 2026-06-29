import { motion } from "framer-motion";
import { Plus, Radar } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { AiActivityFeed } from "@/components/mission/AiActivityFeed";
import { CoachBrief } from "@/components/mission/CoachBrief";
import { ConfidenceIntel } from "@/components/mission/ConfidenceIntel";
import { computeActionImpact, NextBestAction } from "@/components/mission/NextBestAction";
import { MissionHero } from "@/components/mission/MissionHero";
import { RiskIntel } from "@/components/mission/RiskIntel";
import { PageSkeleton } from "@/components/ui/skeleton";
import { useAuthUser } from "@/hooks/useAuth";
import {
  useCoachMessage,
  useMissionDashboard,
  useMissions,
  useUpdateTaskStatus,
  useWeeklyInsights,
} from "@/hooks/useMissions";
import {
  buildActivityFeed,
  buildConfidenceReasons,
  buildRiskExplanation,
  getPrimaryAction,
  pickPrimaryMission,
} from "@/lib/missionIntel";

export function DashboardPage() {
  const user = useAuthUser();
  const navigate = useNavigate();
  const { data: missions, isLoading, error } = useMissions();
  const primary = missions ? pickPrimaryMission(missions) : null;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const activeId = selectedId ?? primary?.id ?? "";

  const { data: dashboard, isLoading: dashLoading } = useMissionDashboard(activeId);
  const { data: coach, isLoading: coachLoading } = useCoachMessage(activeId);
  const { data: weekly } = useWeeklyInsights(activeId);
  const updateTask = useUpdateTaskStatus(activeId);

  if (isLoading) return <PageSkeleton />;

  if (error) {
    return (
      <div className="panel-glow p-8 text-danger">
        Connection lost. Ensure the backend is running at localhost:8000.
      </div>
    );
  }

  if (!missions?.length) {
    return <EmptyCommandCenter />;
  }

  if (dashLoading || !dashboard || !primary) {
    return <PageSkeleton />;
  }

  const action = getPrimaryAction(dashboard);
  const impact = computeActionImpact(dashboard.confidence_score, action.priority);
  const activity = buildActivityFeed(dashboard, weekly);
  const risk = buildRiskExplanation(dashboard);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-10 pb-16"
    >
      {missions.length > 1 ? (
        <div className="flex flex-wrap gap-2">
          {missions.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setSelectedId(m.id)}
              className={`rounded-full border px-4 py-1.5 text-sm transition ${
                m.id === activeId
                  ? "border-accent/40 bg-accent/10 text-accent"
                  : "border-border text-muted hover:text-foreground"
              }`}
            >
              {m.title}
            </button>
          ))}
        </div>
      ) : null}

      <MissionHero mission={dashboard.mission} dashboard={dashboard} missionId={activeId} />

      <NextBestAction
        title={action.title}
        minutes={action.minutes}
        priority={action.priority}
        impact={impact}
        rationale={action.rationale}
        isStarting={updateTask.isPending}
        onStart={() => {
          if (action.taskId) {
            updateTask.mutate({ taskId: action.taskId, status: "in_progress" });
          }
          navigate(`/missions/${activeId}#action`);
        }}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <ConfidenceIntel
          score={dashboard.confidence_score}
          trend={dashboard.confidence_trend}
          reasons={buildConfidenceReasons(dashboard)}
        />
        <RiskIntel
          riskLevel={dashboard.risk_level}
          score={dashboard.deadline_risk_score}
          daysRemaining={dashboard.progress.days_remaining}
          deadline={dashboard.mission.deadline}
          causes={risk.causes}
          topMitigation={risk.topMitigation}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AiActivityFeed events={activity} />
        <CoachBrief
          coach={coach}
          userName={user?.displayName}
          isLoading={coachLoading}
          onStartFocus={() => navigate(`/missions/${activeId}#action`)}
        />
      </div>
    </motion.div>
  );
}

function EmptyCommandCenter() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex min-h-[70vh] flex-col items-center justify-center text-center"
    >
      <div className="panel-glow-accent flex max-w-lg flex-col items-center gap-8 p-12">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10">
          <Radar className="h-8 w-8 text-accent" />
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">What mission are you trying to accomplish?</h1>
          <p className="text-muted leading-relaxed">
            Not tasks. Not reminders. A mission — and an AI that builds your execution system
            around it.
          </p>
        </div>
        <Link
          to="/missions/new"
          className="inline-flex h-12 items-center gap-2 rounded-lg bg-accent px-8 font-medium text-background shadow-glow-sm transition hover:bg-sky-300"
        >
          <Plus className="h-5 w-5" />
          Onboard your first mission
        </Link>
      </div>
    </motion.div>
  );
}
