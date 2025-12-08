import { useState, useMemo } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  Search,
  Plus,
  Filter,
  Edit,
  UserX,
  UserPlus,
  UserCheck,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { Badge } from "../../../components/ui/badge";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { toast } from "sonner";
import { UserFormModal } from "./UserFormModal";
import { AssignInstructorModal } from "./AssignInstructorModal";
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useLinkCoach,
} from "../api/useUsersApi";
import type { UserResponse } from "../api/usersApi";
import type { UserRole, UserStatus } from "../types";
import {
  getRoleDisplayName,
  getStatusDisplayName,
  ROLE_FILTER_OPTIONS,
  STATUS_FILTER_OPTIONS,
  displayNameToRole,
  displayNameToStatus,
} from "../types";

// =============================================================================
// Component
// =============================================================================

export function UserManagement() {
  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("Todos");
  const [selectedStatus, setSelectedStatus] = useState("Todos");
  const [selectedCoach, setSelectedCoach] = useState("Todos");

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assigningClient, setAssigningClient] = useState<UserResponse | null>(null);

  // ---------------------------------------------------------------------------
  // API Hooks
  // ---------------------------------------------------------------------------

  // Build query params based on filters
  const queryParams = useMemo(() => {
    const params: {
      name?: string;
      role?: "ADMIN" | "COACH" | "MEMBER";
      status?: "PENDING" | "ACTIVE" | "INACTIVE";
      page?: number;
      size?: number;
    } = {
      page: 0,
      size: 100, // Fetch all for client-side filtering by coach
    };

    // Add role filter if not "Todos"
    const roleFilter = displayNameToRole[selectedRole];
    if (roleFilter) {
      params.role = roleFilter;
    }

    // Add status filter if not "Todos"
    const statusFilter = displayNameToStatus[selectedStatus];
    if (statusFilter) {
      params.status = statusFilter;
    }

    return params;
  }, [selectedRole, selectedStatus]);

  const {
    data: usersData,
    isLoading,
    isError,
    error,
    refetch,
  } = useUsers(queryParams);

  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();
  const linkCoachMutation = useLinkCoach();

  // ---------------------------------------------------------------------------
  // Derived Data
  // ---------------------------------------------------------------------------

  const users = usersData?.users ?? [];

  // Get unique coaches from the users list
  const coaches = useMemo(() => {
    const coachUsers = users.filter((u) => u.role === "COACH");
    return ["Todos", ...coachUsers.map((u) => u.name)];
  }, [users]);

  // Get coaches list for form/assignment modals
  const coachesList = useMemo(() => {
    return users
      .filter((u) => u.role === "COACH" && u.status === "ACTIVE")
      .map((u) => ({ id: u.id, name: u.name }));
  }, [users]);

  // Build a map of coachId -> coachName for display
  const coachNameMap = useMemo(() => {
    const map = new Map<string, string>();
    users.filter((u) => u.role === "COACH").forEach((u) => {
      map.set(u.id, u.name);
    });
    return map;
  }, [users]);

  // Filter users based on search and coach filter (role/status already filtered by API)
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Search filter
      const matchesSearch =
        !searchTerm ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());

      // Coach filter (client-side since API doesn't support filtering by assigned coach)
      const matchesCoach =
        selectedCoach === "Todos" ||
        (user.role === "MEMBER" && coachNameMap.get(user.coachId || "") === selectedCoach);

      return matchesSearch && matchesCoach;
    });
  }, [users, searchTerm, selectedCoach, coachNameMap]);

  // ---------------------------------------------------------------------------
  // Styling Helpers
  // ---------------------------------------------------------------------------

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case "ADMIN":
        return "bg-[#FA1768]/20 text-[#FA1768] border-[#FA1768]/30";
      case "COACH":
        return "bg-[#E6B949]/20 text-[#E6B949] border-[#E6B949]/30";
      case "MEMBER":
        return "bg-[#333333]/10 text-[#333333] border-[#333333]/20";
      default:
        return "bg-[#333333]/10 text-[#333333] border-[#333333]/20";
    }
  };

  const getStatusBadgeColor = (status: UserStatus) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800 border-green-200";
      case "INACTIVE":
        return "bg-gray-100 text-gray-600 border-gray-200";
      case "PENDING":
        return "bg-[#E6B949]/20 text-[#E6B949] border-[#E6B949]/30";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleCreateUser = () => {
    setEditingUser(null);
    setIsFormModalOpen(true);
  };

  const handleEditUser = (user: UserResponse) => {
    setEditingUser(user);
    setIsFormModalOpen(true);
  };

  const handleSaveUser = async (userData: {
    name: string;
    email: string;
    role?: UserRole;
    coachId?: string;
  }) => {
    try {
      if (editingUser) {
        // Update existing user
        await updateUserMutation.mutateAsync({
          userId: editingUser.id,
          data: {
            name: userData.name,
            email: userData.email,
          },
        });
        toast.success(`Usuário ${userData.name} atualizado com sucesso!`);
      } else {
        // Create new user
        await createUserMutation.mutateAsync({
          name: userData.name,
          email: userData.email,
          role: userData.role || "MEMBER",
          coachId: userData.coachId,
        });
        toast.success(
          `Usuário ${userData.name} criado com sucesso! Um email de ativação foi enviado.`
        );
      }
      setIsFormModalOpen(false);
      refetch();
    } catch (err) {
      console.error("Error saving user:", err);
      toast.error(
        editingUser
          ? "Erro ao atualizar usuário. Tente novamente."
          : "Erro ao criar usuário. Tente novamente."
      );
    }
  };

  const handleAssignCoach = (user: UserResponse) => {
    setAssigningClient(user);
    setIsAssignModalOpen(true);
  };

  const handleSaveAssignment = async (
    clientId: string,
    coachId: string | undefined
  ) => {
    if (!coachId) {
      // TODO: API doesn't support unlinking coaches currently
      toast.info("Para desvincular um treinador, entre em contato com o suporte.");
      setIsAssignModalOpen(false);
      return;
    }

    try {
      await linkCoachMutation.mutateAsync({ userId: clientId, coachId });
      const coach = coachesList.find((c) => c.id === coachId);
      toast.success(`Treinador ${coach?.name} vinculado com sucesso!`);
      setIsAssignModalOpen(false);
      refetch();
    } catch (err) {
      console.error("Error linking coach:", err);
      toast.error("Erro ao vincular treinador. Tente novamente.");
    }
  };

  const handleInactivateUser = async (user: UserResponse) => {
    try {
      await deleteUserMutation.mutateAsync(user.id);
      toast.success(`Usuário ${user.name} inativado com sucesso!`);
      refetch();
    } catch (err) {
      console.error("Error inactivating user:", err);
      toast.error("Erro ao inativar usuário. Tente novamente.");
    }
  };

  // Note: Reactivating users is not supported by the current API
  // The DELETE endpoint only inactivates users, there's no reactivation endpoint
  const handleActivateUser = (user: UserResponse) => {
    toast.info(
      `Reativação de usuário não disponível. Entre em contato com o suporte para reativar ${user.name}.`
    );
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-[#FA1768]" />
          <p className="text-sm text-[#333333]/70">Carregando usuários...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <AlertCircle className="w-12 h-12 text-[#FA1768]" />
          <p className="text-[#333333]/70">Erro ao carregar usuários</p>
          <p className="text-sm text-[#333333]/50">
            {error instanceof Error ? error.message : "Tente novamente"}
          </p>
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="border-[#FA1768] text-[#FA1768] hover:bg-[#FA1768]/10"
          >
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#333333]/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-[#333333] mb-1">
              Gerenciar Usuários
            </h1>
            <p className="text-[#333333]/70">
              Gerencie administradores, treinadores e clientes
            </p>
          </div>
          <Button
            onClick={handleCreateUser}
            className="bg-[#FA1768] hover:bg-[#FA1768]/90 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar Novo Usuário
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-[300px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#333333]/50" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome ou email..."
              className="pl-10 border-[#333333]/20 focus:border-[#FA1768] focus:ring-[#FA1768]"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="border-[#333333]/20 text-[#333333]"
              >
                <Filter className="w-4 h-4 mr-2" />
                Função:{" "}
                <span className="ml-1 text-[#FA1768]">{selectedRole}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {ROLE_FILTER_OPTIONS.map((role) => (
                <DropdownMenuItem
                  key={role}
                  onClick={() => setSelectedRole(role)}
                >
                  {role}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="border-[#333333]/20 text-[#333333]"
              >
                <Filter className="w-4 h-4 mr-2" />
                Status:{" "}
                <span className="ml-1 text-[#FA1768]">{selectedStatus}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {STATUS_FILTER_OPTIONS.map((status) => (
                <DropdownMenuItem
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                >
                  {status}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="border-[#333333]/20 text-[#333333]"
              >
                <Filter className="w-4 h-4 mr-2" />
                Treinador:{" "}
                <span className="ml-1 text-[#FA1768]">
                  {selectedCoach === "Todos" ? "Todos" : selectedCoach}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {coaches.map((coach) => (
                <DropdownMenuItem
                  key={coach}
                  onClick={() => setSelectedCoach(coach)}
                >
                  {coach}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* User Table */}
      <div className="flex-1 overflow-auto p-6">
        <div className="mb-4 text-sm text-[#333333]/70">
          Mostrando {filteredUsers.length} usuário
          {filteredUsers.length !== 1 ? "s" : ""}
        </div>

        <div className="bg-white border border-[#333333]/10 rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#333333]/5 hover:bg-[#333333]/5 border-b-0">
                <TableHead>Usuário</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Treinador</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={5}
                    className="text-center py-12 text-[#333333]/50"
                  >
                    Nenhum usuário encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-[#FA1768] text-white">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-[#333333]/70">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getRoleBadgeColor(user.role)}
                      >
                        {getRoleDisplayName(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.role === "MEMBER" ? (
                        user.coachId && coachNameMap.get(user.coachId) ? (
                          <span className="text-[#333333]/70">
                            {coachNameMap.get(user.coachId)}
                          </span>
                        ) : (
                          <span className="text-[#333333]/40">
                            Não vinculado
                          </span>
                        )
                      ) : (
                        <span className="text-[#333333]/40">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getStatusBadgeColor(user.status)}
                      >
                        {getStatusDisplayName(user.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {user.role === "MEMBER" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAssignCoach(user)}
                            disabled={linkCoachMutation.isPending}
                            className="border-[#333333]/20 text-[#333333] hover:bg-[#333333]/5"
                          >
                            <UserPlus className="w-4 h-4 mr-1" />
                            Vincular
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                          disabled={updateUserMutation.isPending}
                          className="border-[#333333]/20 text-[#333333] hover:bg-[#333333]/5"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                        {user.status === "ACTIVE" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleInactivateUser(user)}
                            disabled={deleteUserMutation.isPending}
                            className="border-[#FA1768] text-[#FA1768] hover:bg-[#FA1768]/10"
                          >
                            {deleteUserMutation.isPending ? (
                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            ) : (
                              <UserX className="w-4 h-4 mr-1" />
                            )}
                            Inativar
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleActivateUser(user)}
                            className="border-green-600 text-green-600 hover:bg-green-50"
                          >
                            <UserCheck className="w-4 h-4 mr-1" />
                            Ativar
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* User Form Modal */}
      <UserFormModal
        open={isFormModalOpen}
        onOpenChange={setIsFormModalOpen}
        user={editingUser}
        coaches={coachesList}
        onSave={handleSaveUser}
        isLoading={createUserMutation.isPending || updateUserMutation.isPending}
      />

      {/* Assign Coach Modal */}
      <AssignInstructorModal
        open={isAssignModalOpen}
        onOpenChange={setIsAssignModalOpen}
        client={assigningClient}
        coaches={coachesList}
        onAssign={handleSaveAssignment}
        isLoading={linkCoachMutation.isPending}
      />
    </div>
  );
}
