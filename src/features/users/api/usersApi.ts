/**
 * Users API - Re-exports and additional types for User Management feature
 *
 * This file re-exports user-related API functions from clientsApi
 * and provides consistent typing for the UserManagement feature.
 */

// Re-export API functions from clientsApi
export {
  fetchUser,
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  linkCoach,
} from "../../clients/api/clientsApi";

// Re-export types from clientsApi
export type {
  UserResponse,
  UsersListResponse,
} from "../../clients/api/clientsApi";

// Additional types for the users feature

/**
 * Query parameters for fetching users list
 * Based on GET /api/v1/users endpoint
 */
export interface FetchUsersParams {
  name?: string;
  role?: "ADMIN" | "COACH" | "MEMBER";
  status?: "PENDING" | "ACTIVE" | "INACTIVE";
  page?: number;
  size?: number;
}

/**
 * Request payload for creating a new user
 * Based on POST /api/v1/users endpoint
 */
export interface CreateUserRequest {
  name: string;
  email: string;
  role: "ADMIN" | "COACH" | "MEMBER";
  coachId?: string; // Required if role is MEMBER
}

/**
 * Request payload for updating a user
 * Based on PUT /api/v1/users/{id} endpoint
 */
export interface UpdateUserRequest {
  name: string;
  email: string;
}

/**
 * Request payload for linking a coach to a member
 * Based on PATCH /api/v1/users/{userId}/coach endpoint
 */
export interface LinkCoachRequest {
  coachId: string;
}

