// =============================================================================
// Client Report Types
// Based on API: GET /api/v1/reports/members/{memberId}
// =============================================================================

/**
 * Workout session from API
 * @see API: GET /api/v1/reports/members/{memberId}
 */
export interface WorkoutSessionResponse {
  workoutSessionId: string;
  date: string; // ISO 8601
  routineName: string;
  durationMinutes: number;
  completed: boolean;
  partiallyCompleted: boolean;
}

/**
 * Member report response from API
 * @see API: GET /api/v1/reports/members/{memberId}
 */
export interface MemberReportResponse {
  memberId: string;
  memberName: string;
  memberEmail: string;
  adherenceRate: number;
  workoutHistory: WorkoutSessionResponse[];
}

/**
 * User response from API (for extended profile data)
 * @see API: GET /api/v1/users/{id}
 */
export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "COACH" | "MEMBER";
  status: "PENDING" | "ACTIVE" | "INACTIVE";
  coachId?: string;
  workoutPerWeek?: number;
  adherenceRate?: number;
  lastWorkoutDate?: string;
  assignedRoutines?: Array<{
    id: string;
    name: string;
    expirationDate: string;
    isExpired: boolean;
  }>;
}

/**
 * Workout session status
 * - completed: session.completed === true
 * - missed: session.completed === false (session scheduled but not done or partially done)
 */
export type WorkoutStatus = "completed" | "missed";

/**
 * Extended workout session with derived status
 */
export interface WorkoutSession extends WorkoutSessionResponse {
  status: WorkoutStatus;
}

/**
 * Statistics calculated from workout history
 */
export interface WorkoutStatistics {
  adherenceRate: number;
  totalWorkouts: number;
  completedWorkouts: number;
  missedWorkouts: number;
  currentStreak: number;
}
