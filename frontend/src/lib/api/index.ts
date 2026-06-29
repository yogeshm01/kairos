import { apiClient } from "@/lib/apiClient";
import type {
  ApplyRecoveryPlanResponse,
  CoachMessageResponse,
  ConfidenceResponse,
  Mission,
  MissionCreate,
  MissionDashboard,
  MissionPlanResponse,
  RecoveryPlanResponse,
  Reflection,
  ReflectionCreate,
  UserProfile,
  WeeklyInsightsResponse,
} from "@/types/api";
import type { Task, TaskStatus } from "@/types/api";

export const missionsApi = {
  list: (token: string) => apiClient<Mission[]>("/missions", { token }),

  get: (token: string, missionId: string) =>
    apiClient<Mission>(`/missions/${missionId}`, { token }),

  create: (token: string, payload: MissionCreate) =>
    apiClient<MissionPlanResponse>("/missions", {
      token,
      method: "POST",
      body: JSON.stringify(payload),
    }),

  dashboard: (token: string, missionId: string) =>
    apiClient<MissionDashboard>(`/missions/${missionId}/dashboard`, { token }),

  confidence: (token: string, missionId: string) =>
    apiClient<ConfidenceResponse>(`/missions/${missionId}/confidence`, { token }),

  coachMessage: (token: string, missionId: string) =>
    apiClient<CoachMessageResponse>(`/missions/${missionId}/coach-message`, { token }),

  weeklyInsights: (token: string, missionId: string) =>
    apiClient<WeeklyInsightsResponse>(`/missions/${missionId}/weekly-insights`, { token }),

  recoveryPlan: (token: string, missionId: string) =>
    apiClient<RecoveryPlanResponse>(`/missions/${missionId}/recovery-plan`, {
      token,
      method: "POST",
    }),

  applyRecoveryPlan: (token: string, missionId: string) =>
    apiClient<ApplyRecoveryPlanResponse>(`/missions/${missionId}/apply-recovery-plan`, {
      token,
      method: "POST",
    }),

  createReflection: (token: string, missionId: string, payload: ReflectionCreate) =>
    apiClient<Reflection>(`/missions/${missionId}/reflections`, {
      token,
      method: "POST",
      body: JSON.stringify(payload),
    }),

  listReflections: (token: string, missionId: string) =>
    apiClient<Reflection[]>(`/missions/${missionId}/reflections`, { token }),
};

export const tasksApi = {
  updateStatus: (token: string, taskId: string, status: TaskStatus) =>
    apiClient<Task>(`/tasks/${taskId}/status`, {
      token,
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};

export const usersApi = {
  me: (token: string) => apiClient<UserProfile>("/me", { token }),
};
