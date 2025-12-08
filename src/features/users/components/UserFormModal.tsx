import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Loader2 } from "lucide-react";
import type { UserResponse } from "../api/usersApi";
import type { UserRole } from "../types";
import { getRoleDisplayName } from "../types";

// =============================================================================
// Types
// =============================================================================

interface Coach {
  id: string;
  name: string;
}

interface UserFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: UserResponse | null;
  coaches: Coach[];
  onSave: (user: {
    name: string;
    email: string;
    role?: UserRole;
    coachId?: string;
  }) => void;
  isLoading?: boolean;
}

// =============================================================================
// Form Data
// =============================================================================

interface FormData {
  name: string;
  email: string;
  role: UserRole;
  coachId: string;
  workoutPerWeek: number;
}

const INITIAL_FORM_DATA: FormData = {
  name: "",
  email: "",
  role: "MEMBER",
  coachId: "unassigned",
  workoutPerWeek: 3,
};

// =============================================================================
// Component
// =============================================================================

export function UserFormModal({
  open,
  onOpenChange,
  user,
  coaches,
  onSave,
  isLoading = false,
}: UserFormModalProps) {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {}
  );

  // Reset form when modal opens/closes or user changes
  useEffect(() => {
    if (open) {
      if (user) {
        setFormData({
          name: user.name,
          email: user.email,
          role: user.role,
          coachId: user.coachId || "unassigned",
          workoutPerWeek: user.workoutPerWeek || 3,
        });
      } else {
        setFormData(INITIAL_FORM_DATA);
      }
      setErrors({});
    }
  }, [user, open]);

  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const userData: {
      name: string;
      email: string;
      role?: UserRole;
      coachId?: string;
    } = {
      name: formData.name,
      email: formData.email,
    };

    // Only include role and coachId for new users
    if (!user) {
      userData.role = formData.role;
      if (formData.role === "MEMBER" && formData.coachId !== "unassigned") {
        userData.coachId = formData.coachId;
      }
    }

    onSave(userData);
  };

  const handleRoleChange = (value: string) => {
    const role = value as UserRole;
    setFormData({
      ...formData,
      role,
      // Reset coach if not a MEMBER
      coachId: role !== "MEMBER" ? "unassigned" : formData.coachId,
    });
    // Clear coach error when role changes
    if (errors.coachId) {
      setErrors({ ...errors, coachId: undefined });
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-[#333333]">
            {user ? "Editar Usuário" : "Criar Novo Usuário"}
          </DialogTitle>
          <DialogDescription className="text-[#333333]/70">
            {user
              ? "Atualize as informações do usuário abaixo."
              : "Preencha as informações para criar um novo usuário. Um email de ativação será enviado."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Nome */}
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-[#333333]">
                Nome Completo *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: undefined });
                }}
                placeholder="Digite o nome completo"
                className={`border-[#333333]/20 focus:border-[#FA1768] focus:ring-[#FA1768] ${
                  errors.name ? "border-[#FA1768]" : ""
                }`}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-sm text-[#FA1768]">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-[#333333]">
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
                placeholder="email@exemplo.com"
                className={`border-[#333333]/20 focus:border-[#FA1768] focus:ring-[#FA1768] ${
                  errors.email ? "border-[#FA1768]" : ""
                }`}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-[#FA1768]">{errors.email}</p>
              )}
            </div>

            {/* Função - Only show for new users */}
            {!user && (
              <div className="grid gap-2">
                <Label htmlFor="role" className="text-[#333333]">
                  Função *
                </Label>
                <Select
                  value={formData.role}
                  onValueChange={handleRoleChange}
                  disabled={isLoading}
                >
                  <SelectTrigger className="border-[#333333]/20 focus:border-[#FA1768] focus:ring-[#FA1768]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="COACH">Treinador</SelectItem>
                    <SelectItem value="MEMBER">Cliente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Show role badge when editing */}
            {user && (
              <div className="grid gap-2">
                <Label className="text-[#333333]">Função</Label>
                <div className="text-sm text-[#333333]/70 bg-[#333333]/5 px-3 py-2 rounded-md">
                  {getRoleDisplayName(user.role)}
                  <span className="text-xs text-[#333333]/50 ml-2">
                    (não pode ser alterado)
                  </span>
                </div>
              </div>
            )}

            {/* Treinador - Only for MEMBER role when creating */}
            {!user && formData.role === "MEMBER" && (
              <div className="grid gap-2">
                <Label htmlFor="coach" className="text-[#333333]">
                  Treinador Responsável
                </Label>
                <Select
                  value={formData.coachId}
                  onValueChange={(value) => {
                    setFormData({ ...formData, coachId: value });
                    if (errors.coachId)
                      setErrors({ ...errors, coachId: undefined });
                  }}
                  disabled={isLoading}
                >
                  <SelectTrigger
                    className={`border-[#333333]/20 focus:border-[#FA1768] focus:ring-[#FA1768] ${
                      errors.coachId ? "border-[#FA1768]" : ""
                    }`}
                  >
                    <SelectValue placeholder="Selecione um treinador" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Não vinculado</SelectItem>
                    {coaches.map((coach) => (
                      <SelectItem key={coach.id} value={coach.id}>
                        {coach.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.coachId && (
                  <p className="text-sm text-[#FA1768]">{errors.coachId}</p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-[#333333]/20 text-[#333333]"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-[#FA1768] hover:bg-[#FA1768]/90 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : user ? (
                "Salvar Alterações"
              ) : (
                "Criar Usuário"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
