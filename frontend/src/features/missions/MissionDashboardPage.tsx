import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { AiActivityFeed } from "@/components/mission/AiActivityFeed";
import { CoachBrief } from "@/components/mission/CoachBrief";
import { ConfidenceIntel } from "@/components/mission/ConfidenceIntel";
import { ConfidenceSimulator } from "@/components/mission/ConfidenceSimulator";
import { ExecutionGraph } from "@/components/mission/ExecutionGraph";
import { ExecutionTimeline } from "@/components/mission/ExecutionTimeline";
import { computeActionImpact, NextBestAction } from "@/components/mission/NextBestAction";
import { MissionReplay } from "@/components/mission/MissionReplay";
import { ProgressStory } from "@/components/mission/ProgressStory";
import { RecoveryMode } from "@/components/mission/RecoveryMode";
import { ReflectionChat } from "@/components/mission/ReflectionChat";
import { RiskIntel } from "@/components/mission/RiskIntel";
import { PageSkeleton } from "@/components/ui/skeleton";
import { useAuthUser } from "@/hooks/useAuth";
import {
  useApplyRecoveryPlan,
  useCoachMessage,
  useCreateReflection,
  useMissionDashboard,
  useRecoveryPlan,
  useUpdateTaskStatus,
  useWeeklyInsights,
} from "@/hooks/useMissions";
import {
  buildActivityFeed,
  buildConfidenceReasons,
  buildReplayEvents,
  buildRiskExplanation,
  getPrimaryAction,
  hasMissedWork,
  formatCountdown,
  hoursPerDay,
} from "@/lib/missionIntel";
import { riskColor } from "@/lib/utils";
import type { RecoveryPlanResponse } from "@/types/api";

export function MissionDashboardPage() {
  const { id = "" } = useParams();
  const user = useAuthUser();
  const { data, isLoading, error } = useMissionDashboard(id);
  const { data: coach, isLoading: coachLoading } = useCoachMessage(id);
  const { data: weekly } = useWeeklyInsights(id);
  const updateTask = useUpdateTaskStatus(id);
  const createReflection = useCreateReflection(id);
  const generateRecovery = useRecoveryPlan(id);
  const applyRecovery = useApplyRecoveryPlan(id);
  const [recoveryPlan, setRecoveryPlan] = useState<RecoveryPlanResponse | undefined>();
  const [showRecovery, setShowRecovery] = useState(false);

  useEffect(() => {
    if (data && hasMissedWork(data)) {
      setShowRecovery(true);
      if (!recoveryPlan && !generateRecovery.isPending) {
        generateRecovery.mutate(undefined, { onSuccess: setRecoveryPlan });
      }
    }
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) return <PageSkeleton />;

  if (error || !data) {
    return (
      <div className="panel-glow p-8 text-danger">Failed to load mission command center.</div>
    );
  }

  const { mission, progress, upcoming_milestones, recent_reflections } = data;
  const action = getPrimaryAction(data);
  const impact = computeActionImpact(data.confidence_score, action.priority);
  const activity = buildActivityFeed(data, weekly);
  const risk = buildRiskExplanation(data);
  const replay = buildReplayEvents(mission, recent_reflections, progress);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-10 pb-20"
    >
      <Link to="/dashboard" className="text-sm text-muted hover:text-foreground">
        ← Command Center
      </Link>

      {/* Top bar */}
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
          <span className={riskColor(data.risk_level)}>{data.risk_level} risk</span>
          <span>·</span>
          <span>{formatCountdown(mission.deadline)}</span>
          <span>·</span>
          <span className="text-2xl font-semibold tabular-nums text-gradient">
            {data.confidence_score}%
          </span>
          <span>confidence</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{mission.title}</h1>
      </header>

      <RecoveryMode
        visible={showRecovery}
        plan={recoveryPlan}
        isGenerating={generateRecovery.isPending}
        isApplying={applyRecovery.isPending}
        onGenerate={() => generateRecovery.mutate(undefined, { onSuccess: setRecoveryPlan })}
        onApply={() =>
          applyRecovery.mutate(undefined, {
            onSuccess: () => {
              setRecoveryPlan(undefined);
              setShowRecovery(false);
            },
          })
        }
      />

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
        }}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <ExecutionGraph
          missionTitle={mission.title}
          milestones={upcoming_milestones}
          tasks={data.todays_tasks}
        />
        <AiActivityFeed events={activity} />
      </div>

      <ExecutionTimeline milestones={upcoming_milestones} tasks={data.todays_tasks} />

      <div className="grid gap-6 lg:grid-cols-2">
        <ConfidenceIntel
          score={data.confidence_score}
          trend={data.confidence_trend}
          reasons={buildConfidenceReasons(data)}
        />
        <RiskIntel
          riskLevel={data.risk_level}
          score={data.deadline_risk_score}
          daysRemaining={progress.days_remaining}
          deadline={mission.deadline}
          causes={risk.causes}
          topMitigation={risk.topMitigation}
        />
      </div>

      <ProgressStory
        confidenceScore={data.confidence_score}
        completionRate={progress.completion_rate}
        riskScore={data.deadline_risk_score}
        daysRemaining={progress.days_remaining}
        weeklyScores={weekly?.confidence_scores}
      />

      <ConfidenceSimulator
        baseScore={data.confidence_score}
        currentHours={hoursPerDay(mission)}
        daysRemaining={progress.days_remaining}
        completionRate={progress.completion_rate}
      />

      <CoachBrief
        coach={coach}
        userName={user?.displayName}
        isLoading={coachLoading}
        onStartFocus={() => {
          document.getElementById("action")?.scrollIntoView({ behavior: "smooth" });
        }}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <ReflectionChat
          reflections={recent_reflections}
          isSubmitting={createReflection.isPending}
          onSubmit={async (values) => {
            await createReflection.mutateAsync(values);
          }}
        />
        <MissionReplay events={replay} />
      </div>
    </motion.div>
  );
}
