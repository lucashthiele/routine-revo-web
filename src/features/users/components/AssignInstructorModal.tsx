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
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { UserPlus, Loader2 } from "lucide-react";
import type { UserResponse } from "../api/usersApi";

// =============================================================================
// Types
// =============================================================================

interface Coach {
  id: string;
  name: string;
}

interface AssignInstructorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: UserResponse | null;
  coaches: Coach[];
  onAssign: (clientId: string, coachId: string | undefined) => void;
  isLoading?: boolean;
}

// =============================================================================
// Component
// =============================================================================

export function AssignInstructorModal({
  open,
  onOpenChange,
  client,
  coaches,
  onAssign,
  isLoading = false,
}: AssignInstructorModalProps) {
  const [selectedCoachId, setSelectedCoachId] = useState<string>("unassigned");

  // Reset selection when modal opens or client changes
  useEffect(() => {
    if (open && client) {
      setSelectedCoachId(client.coachId || "unassigned");
    }
  }, [client, open]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!client) return;

    const coachIdToAssign =
      selectedCoachId === "unassigned" ? undefined : selectedCoachId;
    onAssign(client.id, coachIdToAssign);
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (!client) return null;

  // Get current coach name for display
  const currentCoach = client.coachId
    ? coaches.find((c) => c.id === client.coachId)
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="text-[#333333] flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#FA1768]" />
            Vincular Treinador
          </DialogTitle>
          <DialogDescription className="text-[#333333]/70">
            Atribua um treinador para o cliente{" "}
            <span className="font-medium text-[#333333]">{client.name}</span>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Client Info */}
            <div className="bg-[#333333]/5 rounded-lg p-4">
              <div className="space-y-1">
                <p className="text-[#333333] font-medium">{client.name}</p>
                <p className="text-[#333333]/70 text-sm">{client.email}</p>
                {currentCoach ? (
                  <p className="text-[#333333]/60 text-sm">
                    Treinador atual:{" "}
                    <span className="font-medium text-[#333333]">
                      {currentCoach.name}
                    </span>
                  </p>
                ) : (
                  <p className="text-[#333333]/40 text-sm">
                    Nenhum treinador vinculado
                  </p>
                )}
              </div>
            </div>

            {/* Coach Selection */}
            <div className="grid gap-2">
              <Label htmlFor="coach" className="text-[#333333]">
                Selecionar Treinador
              </Label>
              <Select
                value={selectedCoachId}
                onValueChange={setSelectedCoachId}
                disabled={isLoading}
              >
                <SelectTrigger className="border-[#333333]/20 focus:border-[#FA1768] focus:ring-[#FA1768]">
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
            </div>
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
              ) : (
                "Salvar Vinculação"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
