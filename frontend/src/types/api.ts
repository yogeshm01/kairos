export type RiskLevel = "low" | "medium" | "high" | "critical";
export type TaskStatus = "pending" | "in_progress" | "completed" | "skipped" | "blocked";
export type TaskPriority = "low" | "medium" | "high" | "critical";
export type MissionStatus = "active" | "completed" | "paused" | "at_risk";
export type IntensityPreference = "light" | "balanced" | "intense";

export type UserProfile = {
  uid: string;
  email: string | null;
  name: string | null;
  picture: string | null;
};

export type Mission = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  deadline: string;
  why_it_matters: string | null;
  available_minutes_per_day: number | null;
  intensity_preference: IntensityPreference;
  status: MissionStatus;
  confidence_score: number;
  risk_level: RiskLevel;
  next_best_action: string | null;
  created_at: string;
  updated_at: string;
};

export type MissionCreate = {
  title: string;
  description?: string;
  deadline: string;
  why_it_matters?: string;
  available_minutes_per_day?: number;
  intensity_preference?: IntensityPreference;
};

export type Milestone = {
  id: string;
  mission_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: string;
  order_index: number;
};

export type Task = {
  id: string;
  mission_id: string;
  milestone_id: string | null;
  title: string;
  description: string | null;
  scheduled_date: string | null;
  estimated_minutes: number | null;
  priority: TaskPriority;
  rationale: string | null;
  status: TaskStatus;
  order_index: number;
};

export type DailyPlan = {
  id: string;
  mission_id: string;
  plan_date: string;
  focus: string;
  summary: string | null;
  task_ids: string[];
  estimated_minutes: number;
  risk_level: RiskLevel;
  coach_message: string | null;
};

export type MissionAnalysis = {
  mission_summary: string;
  success_strategy: string;
  key_risks: string[];
  confidence_score: number;
  risk_level: RiskLevel;
  next_best_action: string;
};

export type MissionPlanResponse = {
  mission: Mission;
  milestones: Milestone[];
  tasks: Task[];
  analysis: MissionAnalysis;
  daily_plan: DailyPlan | null;
};

export type DashboardTask = {
  task: Task;
  why_it_matters: string | null;
};

export type MissionProgress = {
  completion_rate: number;
  completed_tasks: number;
  total_tasks: number;
  completed_milestones: number;
  total_milestones: number;
  days_remaining: number;
};

export type MissionDashboard = {
  mission: Mission;
  progress: MissionProgress;
  confidence_score: number;
  confidence_trend: string;
  risk_level: RiskLevel;
  deadline_risk_score: number;
  next_best_action: string;
  ai_suggestions: string[];
  todays_plan: DailyPlan | null;
  todays_tasks: DashboardTask[];
  upcoming_milestones: Milestone[];
  recent_reflections: Reflection[];
};

export type ConfidenceResponse = {
  mission_id: string;
  score: number;
  trend: string;
  reasons: string[];
  recommended_action: string;
  risk_level: RiskLevel;
};

export type CoachMessageResponse = {
  mission_id: string;
  message: string;
  risk_insight: string;
  recommended_action: string;
  tone: string;
};

export type Reflection = {
  id: string;
  mission_id: string;
  reflection_date: string;
  completed_summary: string | null;
  blockers: string | null;
  confidence: number;
  energy: number;
  notes: string | null;
  ai_insight: string | null;
};

export type ReflectionCreate = {
  reflection_date: string;
  completed_summary?: string;
  blockers?: string;
  confidence: number;
  energy: number;
  notes?: string;
};

export type RecoveryPlanOutput = {
  what_changed: string;
  at_risk_items: string[];
  compressed_items: string[];
  removed_items: string[];
  new_daily_plan: {
    focus: string;
    summary: string;
    task_titles: string[];
    estimated_minutes: number;
  };
  new_confidence_score: number;
  new_risk_level: RiskLevel;
  next_best_action: string;
  recovery_message: string;
};

export type RecoveryPlanResponse = {
  mission_id: string;
  plan: RecoveryPlanOutput;
  generated_at: string;
};

export type ApplyRecoveryPlanResponse = {
  mission: Mission;
  daily_plan: DailyPlan;
  applied_changes: string[];
  new_confidence_score: number;
  new_risk_level: RiskLevel;
  next_best_action: string;
};

export type WeeklyInsightsResponse = {
  mission_id: string;
  week_start: string;
  week_end: string;
  insights: {
    completion_patterns: string[];
    risk_changes: string[];
    confidence_trend: string;
    best_performing_days: string[];
    repeated_blockers: string[];
    next_week_focus: string;
  };
  confidence_scores: number[];
  task_completion_rates: number[];
};

export type ApiError = {
  detail: string;
};
