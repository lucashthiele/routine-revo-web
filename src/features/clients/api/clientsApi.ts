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
  muscleGroup:
    | "CHEST"
    | "BACK"
    | "SHOULDERS"
    | "BICEPS"
    | "TRICEPS"
    | "LEGS"
    | "GLUTES"
    | "ABS"
    | "CARDIO"
    | "FULL_BODY";
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
  routineType?: "TEMPLATE" | "CUSTOM";
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
  routineType: "TEMPLATE" | "CUSTOM";
  templateId?: string; // Only for CUSTOM routines created from a template
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

export interface BulkSyncRoutinesRequest {
  routineIds: string[];
  expirationDate?: string; // ISO timestamp
}

export interface BulkSyncRoutinesResponse {
  addedCount: number;
  removedCount: number;
  unchangedCount: number;
  message: string;
}

// API Calls

/**
 * Fetch a single user by ID
 * GET /api/v1/users/{id}
 */
export const fetchUser = async (userId: string): Promise<UserResponse> => {
  const response = await api.get<UserResponse>(`/api/v1/users/${userId}`);
  return response.data;
};

/**
 * Fetch list of users (members/clients)
 * GET /api/v1/users
 */
export const fetchUsers = async (params: {
  name?: string;
  role?: "ADMIN" | "COACH" | "MEMBER";
  status?: "PENDING" | "ACTIVE" | "INACTIVE";
  coachId?: string;
  page?: number;
  size?: number;
}): Promise<UsersListResponse> => {
  const response = await api.get<UsersListResponse>("/api/v1/users", {
    params,
  });
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
  const response = await api.get<ExercisesListResponse>("/api/v1/exercises", {
    params,
  });
  return response.data;
};

/**
 * Create a new routine
 * POST /api/v1/routines
 */
export const createRoutine = async (
  data: CreateRoutineRequest
): Promise<CreateRoutineResponse> => {
  const response = await api.post<CreateRoutineResponse>(
    "/api/v1/routines",
    data
  );
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
export const fetchMemberReport = async (
  memberId: string
): Promise<MemberReportResponse> => {
  const response = await api.get<MemberReportResponse>(
    `/api/v1/reports/members/${memberId}`
  );
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
 * Link a coach to a member
 * PATCH /api/v1/users/{userId}/coach
 */
export const linkCoach = async (
  userId: string,
  coachId: string
): Promise<void> => {
  await api.patch(`/api/v1/users/${userId}/coach`, { coachId });
};

/**
 * List routines with pagination and filtering
 * GET /api/v1/routines
 */
export const fetchRoutines = async (params: {
  creatorId?: string;
  memberId?: string;
  isExpired?: boolean;
  routineType?: "TEMPLATE" | "CUSTOM";
  page?: number;
  size?: number;
}): Promise<RoutinesListResponse> => {
  const response = await api.get<RoutinesListResponse>("/api/v1/routines", {
    params,
  });
  return response.data;
};

/**
 * Fetch a single routine by ID
 * GET /api/v1/routines/{id}
 */
export const fetchRoutine = async (
  routineId: string
): Promise<RoutineResponse> => {
  const response = await api.get<RoutineResponse>(
    `/api/v1/routines/${routineId}`
  );
  return response.data;
};

/**
 * Update routine request type
 */
export interface UpdateRoutineRequest {
  name: string;
  description?: string;
  expirationDate?: string;
  memberId?: string;
  items?: RoutineItemRequest[];
}

/**
 * Update a routine
 * PUT /api/v1/routines/{id}
 */
export const updateRoutine = async (
  routineId: string,
  data: UpdateRoutineRequest
): Promise<RoutineResponse> => {
  const response = await api.put<RoutineResponse>(
    `/api/v1/routines/${routineId}`,
    data
  );
  return response.data;
};

/**
 * Delete a routine
 * DELETE /api/v1/routines/{id}
 */
export const deleteRoutine = async (routineId: string): Promise<void> => {
  await api.delete(`/api/v1/routines/${routineId}`);
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

export interface BulkDeleteRoutinesRequest {
  routineIds: string[];
}

export interface BulkDeleteRoutinesResponse {
  deletedCount: number;
  message: string;
}

/**
 * Bulk delete multiple routines from a member
 * DELETE /api/v1/users/members/{memberId}/routines/bulk
 */
export const bulkDeleteRoutines = async (
  memberId: string,
  data: BulkDeleteRoutinesRequest
): Promise<BulkDeleteRoutinesResponse> => {
  const response = await api.delete<BulkDeleteRoutinesResponse>(
    `/api/v1/users/members/${memberId}/routines/bulk`,
    { data }
  );
  return response.data;
};

/**
 * Bulk sync routines for a member (incremental comparison)
 * PUT /api/v1/users/members/{memberId}/routines/bulk
 * 
 * This endpoint syncs routines using incremental comparison:
 * - Adds routines that are in routineIds but not currently assigned
 * - Removes routines that are currently assigned but not in routineIds
 * - Leaves unchanged routines that are in both
 */
export const bulkSyncRoutines = async (
  memberId: string,
  data: BulkSyncRoutinesRequest
): Promise<BulkSyncRoutinesResponse> => {
  const response = await api.put<BulkSyncRoutinesResponse>(
    `/api/v1/users/members/${memberId}/routines/bulk`,
    data
  );
  return response.data;
};
