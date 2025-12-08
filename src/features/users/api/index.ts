// API Functions
export {
  fetchUser,
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  linkCoach,
} from "./usersApi";

// API Types
export type {
  UserResponse,
  UsersListResponse,
  FetchUsersParams,
  CreateUserRequest,
  UpdateUserRequest,
  LinkCoachRequest,
} from "./usersApi";

// React Query Hooks
export {
  usersKeys,
  useUsers,
  useUser,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useLinkCoach,
} from "./useUsersApi";

