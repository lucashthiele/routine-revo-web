// Components
export { UserManagement, UserFormModal, AssignInstructorModal } from "./components";

// API Hooks
export {
  useUsers,
  useUser,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useLinkCoach,
  usersKeys,
} from "./api";

// API Types (from API layer)
export type {
  UserResponse,
  UsersListResponse,
  FetchUsersParams,
  CreateUserRequest as CreateUserApiRequest,
  UpdateUserRequest as UpdateUserApiRequest,
  LinkCoachRequest as LinkCoachApiRequest,
} from "./api";

// Local Types (from types layer)
export type {
  User,
  UserRole,
  UserStatus,
  AssignedRoutine,
  CreateUserRequest,
  UpdateUserRequest,
  LinkCoachRequest,
  UsersQueryParams,
} from "./types";

export {
  roleDisplayNames,
  statusDisplayNames,
  getRoleDisplayName,
  getStatusDisplayName,
  ROLE_FILTER_OPTIONS,
  STATUS_FILTER_OPTIONS,
  displayNameToRole,
  displayNameToStatus,
} from "./types";

