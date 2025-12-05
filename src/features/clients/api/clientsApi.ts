import api from "../../../api/axios";

// Types based on API documentation
export interface AssignedRoutineResponse {
  id: string;
  name: string;
  expirationDate: string; // ISO timestamp
  isExpired: boolean;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "COACH" | "MEMBER";
  status: "PENDING" | "ACTIVE" | "INACTIVE";
  coachId?: string;
  workoutPerWeek?: number;
  adherenceRate?: number;
  lastWorkoutDate?: string; // ISO timestamp
  assignedRoutines?: AssignedRoutineResponse[];
}

export interface UsersListResponse {
  users: UserResponse[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface ExerciseResponse {
  id: string;
  name: string;
  muscleGroup: "CHEST" | "BACK" | "SHOULDERS" | "BICEPS" | "TRICEPS" | "LEGS" | "GLUTES" | "ABS" | "CARDIO" | "FULL_BODY";
  description?: string;
  equipment?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExercisesListResponse {
  exercises: ExerciseResponse[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface RoutineItemRequest {
  exerciseId: string;
  sets: number;
  reps: string;
  load?: number;
  restTime?: string;
  sequenceOrder: number;
}

export interface CreateRoutineRequest {
  name: string;
  description?: string;
  expirationDate?: string; // ISO timestamp
  creatorId: string;
  memberId?: string;
  items?: RoutineItemRequest[];
}

export interface CreateRoutineResponse {
  id: string;
  message: string;
}

export interface AssociateRoutineRequest {
  memberId: string;
}

export interface MemberReportResponse {
  memberId: string;
  memberName: string;
  memberEmail: string;
  adherenceRate: number;
  workoutHistory: Array<{
    workoutSessionId: string;
    date: string;
    routineName: string;
    durationMinutes: number;
  }>;
}

export interface RoutineItemResponse {
  id: string;
  exerciseId: string;
  exerciseName: string;
  exerciseImageUrl?: string;
  sets: number;
  reps: string;
  load?: number;
  restTime?: string;
  sequenceOrder: number;
}

export interface RoutineResponse {
  id: string;
  name: string;
  description?: string;
  expirationDate?: string;
  isExpired: boolean;
  creatorId: string;
  memberId?: string;
  itemCount: number;
  items: RoutineItemResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface RoutinesListResponse {
  routines: RoutineResponse[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface BulkAssignRoutinesRequest {
  routineIds: string[];
  expirationDate?: string; // ISO timestamp
}

export interface BulkAssignRoutinesResponse {
  assignedCount: number;
  message: string;
}

// API Calls

/**
 * Fetch list of users (members/clients)
 * GET /api/v1/users
 */
export const fetchUsers = async (params: {
  name?: string;
  role?: "ADMIN" | "COACH" | "MEMBER";
  status?: "PENDING" | "ACTIVE" | "INACTIVE";
  page?: number;
  size?: number;
}): Promise<UsersListResponse> => {
  const response = await api.get<UsersListResponse>("/api/v1/users", { params });
  return response.data;
};

/**
 * Fetch exercises library
 * GET /api/v1/exercises
 */
export const fetchExercises = async (params: {
  name?: string;
  muscleGroup?: string;
  page?: number;
  size?: number;
}): Promise<ExercisesListResponse> => {
  const response = await api.get<ExercisesListResponse>("/api/v1/exercises", { params });
  return response.data;
};

/**
 * Create a new routine
 * POST /api/v1/routines
 */
export const createRoutine = async (data: CreateRoutineRequest): Promise<CreateRoutineResponse> => {
  const response = await api.post<CreateRoutineResponse>("/api/v1/routines", data);
  return response.data;
};

/**
 * Associate a routine with a member
 * POST /api/v1/routines/{id}/associate
 */
export const associateRoutineWithMember = async (
  routineId: string,
  memberId: string
): Promise<void> => {
  await api.post(`/api/v1/routines/${routineId}/associate`, { memberId });
};

/**
 * Get member performance report
 * GET /api/v1/reports/members/{memberId}
 */
export const fetchMemberReport = async (memberId: string): Promise<MemberReportResponse> => {
  const response = await api.get<MemberReportResponse>(`/api/v1/reports/members/${memberId}`);
  return response.data;
};

/**
 * Update user information
 * PUT /api/v1/users/{id}
 */
export const updateUser = async (
  userId: string,
  data: { name: string; email: string }
): Promise<UserResponse> => {
  const response = await api.put<UserResponse>(`/api/v1/users/${userId}`, data);
  return response.data;
};

/**
 * Inactivate a user (soft delete)
 * DELETE /api/v1/users/{id}
 */
export const deleteUser = async (userId: string): Promise<void> => {
  await api.delete(`/api/v1/users/${userId}`);
};

/**
 * Create a new user (Admin only)
 * POST /api/v1/users
 */
export const createUser = async (data: {
  name: string;
  email: string;
  role: "ADMIN" | "COACH" | "MEMBER";
  coachId?: string;
}): Promise<void> => {
  await api.post("/api/v1/users", data);
};

/**
 * List routines with pagination and filtering
 * GET /api/v1/routines
 */
export const fetchRoutines = async (params: {
  creatorId?: string;
  memberId?: string;
  isExpired?: boolean;
  templatesOnly?: boolean;
  page?: number;
  size?: number;
}): Promise<RoutinesListResponse> => {
  const response = await api.get<RoutinesListResponse>("/api/v1/routines", { params });
  return response.data;
};

/**
 * Bulk assign multiple routines to a member
 * POST /api/v1/users/members/{memberId}/routines/bulk
 */
export const bulkAssignRoutines = async (
  memberId: string,
  data: BulkAssignRoutinesRequest
): Promise<BulkAssignRoutinesResponse> => {
  const response = await api.post<BulkAssignRoutinesResponse>(
    `/api/v1/users/members/${memberId}/routines/bulk`,
    data
  );
  return response.data;
};

