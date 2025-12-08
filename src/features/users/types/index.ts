// =============================================================================
// User Types for User Management Feature
// =============================================================================

/**
 * User roles as defined in the API
 * Note: The UI displays these as localized strings:
 * - ADMIN -> "Admin"
 * - COACH -> "Treinador"
 * - MEMBER -> "Cliente"
 */
export type UserRole = "ADMIN" | "COACH" | "MEMBER";

/**
 * User status as defined in the API
 * Note: The UI displays these as:
 * - ACTIVE -> "Ativo"
 * - INACTIVE -> "Inativo"
 * - PENDING -> "Pendente"
 */
export type UserStatus = "PENDING" | "ACTIVE" | "INACTIVE";

/**
 * Assigned routine summary (from user listing)
 */
export interface AssignedRoutine {
  id: string;
  name: string;
  expirationDate: string | null;
  isExpired: boolean;
}

/**
 * User entity as returned by the API
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  coachId?: string | null;
  coachName?: string; // Populated client-side for display
  workoutPerWeek?: number | null;
  adherenceRate?: number | null;
  lastWorkoutDate?: string | null;
  assignedRoutines?: AssignedRoutine[];
  createdAt?: string;
}

/**
 * Request payload for creating a new user
 * API: POST /api/v1/users
 */
export interface CreateUserRequest {
  name: string;
  email: string;
  role: UserRole;
  coachId?: string; // Required if role is MEMBER
}

/**
 * Request payload for updating a user
 * API: PUT /api/v1/users/{id}
 */
export interface UpdateUserRequest {
  name: string;
  email: string;
}

/**
 * Request payload for linking a coach to a member
 * API: PATCH /api/v1/users/{userId}/coach
 */
export interface LinkCoachRequest {
  coachId: string;
}

/**
 * Paginated response from user listing
 * API: GET /api/v1/users
 */
export interface UsersListResponse {
  users: User[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

/**
 * Query parameters for fetching users
 */
export interface UsersQueryParams {
  name?: string;
  role?: UserRole;
  status?: UserStatus;
  page?: number;
  size?: number;
}

// =============================================================================
// Display Helpers
// =============================================================================

export const roleDisplayNames: Record<UserRole, string> = {
  ADMIN: "Admin",
  COACH: "Treinador",
  MEMBER: "Cliente",
};

export const statusDisplayNames: Record<UserStatus, string> = {
  ACTIVE: "Ativo",
  INACTIVE: "Inativo",
  PENDING: "Pendente",
};

export function getRoleDisplayName(role: UserRole): string {
  return roleDisplayNames[role] || role;
}

export function getStatusDisplayName(status: UserStatus): string {
  return statusDisplayNames[status] || status;
}

// Filter options for the UI
export const ROLE_FILTER_OPTIONS = ["Todos", "Admin", "Treinador", "Cliente"] as const;
export const STATUS_FILTER_OPTIONS = ["Todos", "Ativo", "Inativo", "Pendente"] as const;

// Map display names back to API values
export const displayNameToRole: Record<string, UserRole | undefined> = {
  Admin: "ADMIN",
  Treinador: "COACH",
  Cliente: "MEMBER",
};

export const displayNameToStatus: Record<string, UserStatus | undefined> = {
  Ativo: "ACTIVE",
  Inativo: "INACTIVE",
  Pendente: "PENDING",
};

