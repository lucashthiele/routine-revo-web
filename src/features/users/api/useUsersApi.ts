import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchUser,
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  linkCoach,
  type FetchUsersParams,
  type CreateUserRequest,
  type UpdateUserRequest,
} from "./usersApi";

// =============================================================================
// Query Keys
// =============================================================================

export const usersKeys = {
  all: ["users"] as const,
  lists: () => [...usersKeys.all, "list"] as const,
  list: (filters: FetchUsersParams) => [...usersKeys.lists(), filters] as const,
  details: () => [...usersKeys.all, "detail"] as const,
  detail: (id: string) => [...usersKeys.details(), id] as const,
};

// =============================================================================
// Query Hooks
// =============================================================================

/**
 * Hook to fetch users list with pagination and filtering
 * Endpoint: GET /api/v1/users
 *
 * @param params - Query parameters (name, role, status, page, size)
 * @param options - React Query options
 */
export const useUsers = (
  params: FetchUsersParams = {},
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: usersKeys.list(params),
    queryFn: () => fetchUsers(params),
    enabled: options?.enabled ?? true,
  });
};

/**
 * Hook to fetch a single user by ID
 * Endpoint: GET /api/v1/users/{id}
 *
 * @param userId - User ID
 * @param options - React Query options
 */
export const useUser = (userId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: usersKeys.detail(userId),
    queryFn: () => fetchUser(userId),
    enabled: options?.enabled ?? !!userId,
  });
};

// =============================================================================
// Mutation Hooks
// =============================================================================

/**
 * Hook to create a new user (Admin only)
 * Endpoint: POST /api/v1/users
 *
 * Request body: { name, email, role, coachId? }
 * - coachId is required if role is MEMBER
 * - Server sends activation email to the user
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserRequest) => createUser(data),
    onSuccess: () => {
      // Invalidate users list queries to refetch
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
    },
  });
};

/**
 * Hook to update user information
 * Endpoint: PUT /api/v1/users/{id}
 *
 * Request body: { name, email }
 */
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: UpdateUserRequest;
    }) => updateUser(userId, data),
    onSuccess: (_, variables) => {
      // Invalidate both list and detail queries
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: usersKeys.detail(variables.userId),
      });
    },
  });
};

/**
 * Hook to inactivate a user (soft delete)
 * Endpoint: DELETE /api/v1/users/{id}
 *
 * This sets the user status to INACTIVE, not a hard delete
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => deleteUser(userId),
    onSuccess: () => {
      // Invalidate users list queries
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
    },
  });
};

/**
 * Hook to link a coach to a member
 * Endpoint: PATCH /api/v1/users/{userId}/coach
 *
 * Request body: { coachId }
 * - coachId must be a user with COACH role
 */
export const useLinkCoach = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, coachId }: { userId: string; coachId: string }) =>
      linkCoach(userId, coachId),
    onSuccess: (_, variables) => {
      // Invalidate both list and detail queries
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: usersKeys.detail(variables.userId),
      });
    },
  });
};

