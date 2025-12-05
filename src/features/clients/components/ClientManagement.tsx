import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Card, CardContent } from "../../../components/ui/card";
import { useAuth } from "../../../providers/AuthProvider";
import { toast } from "sonner";
import {
  useUsers,
  useExercises,
  useCreateRoutine,
  useAssociateRoutine,
  useRoutines,
  useBulkAssignRoutines,
} from "../api/useClientsApi";
import {
  Search,
  Plus,
  FileText,
  Dumbbell,
  CheckCircle2,
  Circle,
  ArrowLeft,
  Trash2,
  GripVertical,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Textarea } from "../../../components/ui/textarea";
import { Label } from "../../../components/ui/label";
import { Checkbox } from "../../../components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../components/ui/dialog";
import { Badge } from "../../../components/ui/badge";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { ScrollArea } from "../../../components/ui/scroll-area";
import type { Client, Routine, Exercise } from "../types";
import type { UserResponse, ExerciseResponse } from "../api/clientsApi";

// Template routines (since there's no GET /api/v1/routines endpoint)
// These serve as templates for creating new routines
const routineTemplates: Routine[] = [
  {
    id: "template-1",
    name: "Treino A - Upper Body",
    description: "Foco em peito, costas, ombros e braços",
    exercises: 8,
    duration: "60 min",
    level: "Intermediário",
    exerciseList: [
      {
        id: "ex1",
        name: "Supino Reto com Barra",
        sets: "4",
        reps: "8-10",
        rest: "90s",
      },
      {
        id: "ex2",
        name: "Supino Inclinado com Halteres",
        sets: "3",
        reps: "10-12",
        rest: "60s",
      },
      {
        id: "ex3",
        name: "Remada com Barra",
        sets: "4",
        reps: "8-10",
        rest: "90s",
      },
      {
        id: "ex4",
        name: "Puxada Frontal",
        sets: "3",
        reps: "10-12",
        rest: "60s",
      },
      {
        id: "ex5",
        name: "Desenvolvimento de Ombros",
        sets: "3",
        reps: "10-12",
        rest: "60s",
      },
      {
        id: "ex6",
        name: "Elevação Lateral",
        sets: "3",
        reps: "12-15",
        rest: "45s",
      },
      {
        id: "ex7",
        name: "Rosca Direta com Barra",
        sets: "3",
        reps: "10-12",
        rest: "60s",
      },
      {
        id: "ex8",
        name: "Tríceps Pulley",
        sets: "3",
        reps: "12-15",
        rest: "45s",
      },
    ],
  },
  {
    id: "template-2",
    name: "Treino B - Lower Body",
    description: "Pernas completas e glúteos",
    exercises: 10,
    duration: "75 min",
    level: "Intermediário",
    exerciseList: [
      {
        id: "ex9",
        name: "Agachamento com Barra",
        sets: "4",
        reps: "8-10",
        rest: "120s",
      },
      { id: "ex10", name: "Leg Press", sets: "4", reps: "10-12", rest: "90s" },
      {
        id: "ex11",
        name: "Levantamento Terra",
        sets: "4",
        reps: "6-8",
        rest: "120s",
      },
      {
        id: "ex12",
        name: "Cadeira Extensora",
        sets: "3",
        reps: "12-15",
        rest: "60s",
      },
      {
        id: "ex13",
        name: "Cadeira Flexora",
        sets: "3",
        reps: "12-15",
        rest: "60s",
      },
      {
        id: "ex14",
        name: "Elevação Pélvica",
        sets: "3",
        reps: "12-15",
        rest: "60s",
      },
      {
        id: "ex15",
        name: "Stiff com Halteres",
        sets: "3",
        reps: "10-12",
        rest: "60s",
      },
      {
        id: "ex16",
        name: "Panturrilha no Leg Press",
        sets: "4",
        reps: "15-20",
        rest: "45s",
      },
      {
        id: "ex17",
        name: "Abdução de Quadril",
        sets: "3",
        reps: "15-20",
        rest: "45s",
      },
      {
        id: "ex18",
        name: "Adução de Quadril",
        sets: "3",
        reps: "15-20",
        rest: "45s",
      },
    ],
  },
];

interface ClientManagementProps {
  onNavigateToReport?: (clientId: string, clientName: string) => void;
}

// Helper to format last workout date
const formatLastWorkout = (dateString?: string): string => {
  if (!dateString) return "N/A";

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "há alguns minutos";
  if (diffHours < 24) return `há ${diffHours} hora${diffHours > 1 ? "s" : ""}`;
  if (diffDays < 7) return `há ${diffDays} dia${diffDays > 1 ? "s" : ""}`;
  if (diffDays < 30)
    return `há ${Math.floor(diffDays / 7)} semana${diffDays >= 14 ? "s" : ""}`;
  return `há ${Math.floor(diffDays / 30)} mes${diffDays >= 60 ? "es" : ""}`;
};

// Helper to convert API user to Client format
const userToClient = (user: UserResponse): Client => {
  const assignedRoutines =
    user.assignedRoutines?.map((routine) => ({
      routineId: routine.id,
      name: routine.name,
      expirationDate: routine.expirationDate || "",
    })) || [];

  // Get current routine name (most recent non-expired)
  const currentRoutine =
    assignedRoutines.length > 0 ? assignedRoutines[0].name : "N/A";

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    status: user.status === "ACTIVE" ? "Active" : "Inactive",
    currentRoutine,
    lastWorkout: formatLastWorkout(user.lastWorkoutDate),
    adherenceRate: user.adherenceRate || 0,
    trainingDaysPerWeek: user.workoutPerWeek,
    assignedRoutines,
  };
};

export function ClientManagement({
  onNavigateToReport,
}: ClientManagementProps) {
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [isRoutineDialogOpen, setIsRoutineDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedRoutines, setSelectedRoutines] = useState<string[]>([]);
  const [isCreatingRoutine, setIsCreatingRoutine] = useState(false);
  const [newRoutineName, setNewRoutineName] = useState("");
  const [newRoutineDescription, setNewRoutineDescription] = useState("");
  const [newRoutineLevel, setNewRoutineLevel] = useState<
    "Iniciante" | "Intermediário" | "Avançado"
  >("Intermediário");
  const [isStandardRoutine, setIsStandardRoutine] = useState(false);
  const [expirationDate, setExpirationDate] = useState("");
  const [newRoutineExercises, setNewRoutineExercises] = useState<Exercise[]>(
    []
  );
  const [exerciseSearchTerm, setExerciseSearchTerm] = useState("");
  const [routineNameError, setRoutineNameError] = useState("");
  const [routineExercisesError, setRoutineExercisesError] = useState("");

  // API Hooks - Fetch all clients once, filter client-side
  const { data: usersData, isLoading: isLoadingUsers } = useUsers({
    role: "MEMBER",
    status: "ACTIVE",
    page: 0,
    size: 100,
  });

  const { data: exercisesData, isLoading: isLoadingExercises } = useExercises({
    name: exerciseSearchTerm,
    page: 0,
    size: 100,
  });

  // Fetch routines (templates only - routines without assigned members)
  const { data: routinesData, isLoading: isLoadingRoutines } = useRoutines({
    creatorId: currentUser?.id,
    templatesOnly: true,
    page: 0,
    size: 50,
  });

  const createRoutineResult = useCreateRoutine();
  const {
    mutateAsync: createRoutineMutation,
    isPending: isCreatingRoutineMutation,
  } = createRoutineResult;
  const associateRoutineResult = useAssociateRoutine();
  const {
    mutateAsync: associateRoutineMutation,
    isPending: isAssociatingRoutine,
  } = associateRoutineResult;
  const bulkAssignResult = useBulkAssignRoutines();
  const { mutateAsync: bulkAssignMutation, isPending: isBulkAssigning } =
    bulkAssignResult;

  // Convert API data to local format
  const clients: Client[] = usersData?.users.map(userToClient) || [];
  const exerciseLibrary = exercisesData?.exercises || [];

  // Convert API routines to local format
  const availableRoutines: Routine[] =
    routinesData?.routines.map((routine) => ({
      id: routine.id,
      name: routine.name,
      description: routine.description || "",
      exercises: routine.itemCount,
      duration: "N/A", // Not provided by API
      level: "Intermediário", // Not provided by API
      exerciseList: routine.items.map((item) => ({
        id: item.exerciseId,
        name: item.exerciseName,
        sets: item.sets.toString(),
        reps: item.reps,
        rest: item.restTime || "60s",
      })),
    })) || [];

  // Combine with templates as fallback (if API returns empty or user wants templates)
  const allRoutines: Routine[] = [...availableRoutines, ...routineTemplates];

  // Client-side filtering - instant results, no API calls while typing
  const filteredClients = clients.filter((client) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      client.name.toLowerCase().includes(searchLower) ||
      client.email.toLowerCase().includes(searchLower)
    );
  });

  const handleAssignRoutine = (client: Client) => {
    setSelectedClient(client);
    if (client.assignedRoutines && client.assignedRoutines.length > 0) {
      const routineIds = client.assignedRoutines.map((r) => r.routineId);
      setSelectedRoutines(routineIds);
      if (client.assignedRoutines[0].expirationDate) {
        setExpirationDate(client.assignedRoutines[0].expirationDate);
      } else {
        setExpirationDate("");
      }
    } else {
      setSelectedRoutines([]);
      setExpirationDate("");
    }
    setIsRoutineDialogOpen(true);
  };

  const toggleRoutineSelection = (routineId: string) => {
    setSelectedRoutines((prev) =>
      prev.includes(routineId)
        ? prev.filter((id) => id !== routineId)
        : [...prev, routineId]
    );
  };

  const handleAddRoutines = async () => {
    if (selectedRoutines.length === 0 || !selectedClient) {
      toast.error("Selecione pelo menos uma rotina");
      return;
    }

    try {
      // Separate existing routines from templates
      const existingRoutineIds = selectedRoutines.filter((id) =>
        availableRoutines.some((r) => r.id === id)
      );
      const templateIds = selectedRoutines.filter((id) =>
        routineTemplates.some((r) => r.id === id)
      );

      // Use bulk assignment for existing routines
      if (existingRoutineIds.length > 0) {
        await bulkAssignMutation({
          memberId: selectedClient.id,
          data: {
            routineIds: existingRoutineIds,
            expirationDate: expirationDate
              ? new Date(expirationDate).toISOString()
              : undefined,
          },
        });
      }

      // Create new routines from templates
      for (const templateId of templateIds) {
        const template = routineTemplates.find((r) => r.id === templateId);
        if (!template || !currentUser) continue;

        // Create the routine
        await createRoutineMutation({
          name: template.name,
          description: template.description,
          creatorId: currentUser.id,
          memberId: selectedClient.id,
          expirationDate: expirationDate
            ? new Date(expirationDate).toISOString()
            : undefined,
          items: template.exerciseList.map((ex, idx) => ({
            exerciseId: ex.id,
            sets: parseInt(ex.sets),
            reps: ex.reps,
            restTime: ex.rest,
            sequenceOrder: idx + 1,
          })),
        });
      }

      toast.success(
        `${selectedRoutines.length} rotina(s) atribuída(s) para ${selectedClient.name}`
      );
      setIsRoutineDialogOpen(false);
      setSelectedRoutines([]);
    } catch (error) {
      console.error("Error assigning routines:", error);
      toast.error("Erro ao atribuir rotinas. Tente novamente.");
    }
  };

  const handleCreateNewRoutine = () => {
    setIsCreatingRoutine(true);
    setNewRoutineName("");
    setNewRoutineDescription("");
    setNewRoutineLevel("Intermediário");
    setIsStandardRoutine(false);
  };

  const handleCancelCreateRoutine = () => {
    setIsCreatingRoutine(false);
    setNewRoutineName("");
    setNewRoutineDescription("");
    setNewRoutineLevel("Intermediário");
    setIsStandardRoutine(false);
    setNewRoutineExercises([]);
    setExerciseSearchTerm("");
    setRoutineNameError("");
    setRoutineExercisesError("");
  };

  const handleSaveNewRoutine = async () => {
    setRoutineNameError("");
    setRoutineExercisesError("");

    let hasError = false;

    if (!newRoutineName.trim()) {
      setRoutineNameError("Por favor, insira um nome para a rotina");
      hasError = true;
    }

    if (newRoutineExercises.length === 0) {
      setRoutineExercisesError(
        "Por favor, adicione pelo menos um exercício à rotina"
      );
      hasError = true;
    }

    if (hasError) {
      return;
    }

    if (!currentUser) {
      toast.error("Usuário não autenticado");
      return;
    }

    try {
      const result = await createRoutineMutation({
        name: newRoutineName,
        description: newRoutineDescription,
        creatorId: currentUser.id,
        memberId: selectedClient?.id,
        expirationDate: expirationDate
          ? new Date(expirationDate).toISOString()
          : undefined,
        items: newRoutineExercises.map((ex, idx) => ({
          exerciseId: ex.id,
          sets: parseInt(ex.sets),
          reps: ex.reps,
          restTime: ex.rest,
          sequenceOrder: idx + 1,
        })),
      });

      // If creating for a specific client, associate it
      if (selectedClient) {
        await associateRoutineMutation({
          routineId: result.id,
          memberId: selectedClient.id,
        });
      }

      const routineType = isStandardRoutine
        ? "Rotina Padrão"
        : "Rotina Personalizada";
      toast.success(`${routineType} "${newRoutineName}" criada com sucesso!`);
      handleCancelCreateRoutine();
    } catch (error) {
      console.error("Error creating routine:", error);
      toast.error("Erro ao criar rotina. Tente novamente.");
    }
  };

  const filteredExerciseLibrary = exerciseLibrary;

  const addExerciseToRoutine = (exercise: ExerciseResponse) => {
    setNewRoutineExercises([
      ...newRoutineExercises,
      {
        id: exercise.id,
        name: exercise.name,
        sets: "3",
        reps: "10",
        rest: "60s",
        notes: "",
      },
    ]);
    if (routineExercisesError) setRoutineExercisesError("");
  };

  const removeExerciseFromRoutine = (index: number) => {
    setNewRoutineExercises(newRoutineExercises.filter((_, i) => i !== index));
  };

  const updateRoutineExercise = (
    index: number,
    field: string,
    value: string
  ) => {
    const updated = [...newRoutineExercises];
    updated[index] = { ...updated[index], [field]: value };
    setNewRoutineExercises(updated);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case "Iniciante":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Intermediário":
        return "bg-[#E6B949]/20 text-[#E6B949] border-[#E6B949]/30";
      case "Avançado":
        return "bg-[#FA1768]/20 text-[#FA1768] border-[#FA1768]/30";
      default:
        return "bg-[#333333]/10 text-[#333333] border-[#333333]/20";
    }
  };

  const getExpiredRoutinesCount = (client: Client) => {
    if (!client.assignedRoutines) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return client.assignedRoutines.filter((routine) => {
      if (!routine.expirationDate) return false;
      const expirationDate = new Date(routine.expirationDate);
      expirationDate.setHours(0, 0, 0, 0);
      return expirationDate < today;
    }).length;
  };

  if (isLoadingUsers) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-[#FA1768]" />
          <p className="text-sm text-[#333333]/70">Carregando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#333333]/10 p-6">
        <div className="mb-4">
          <h1 className="text-[#333333] mb-1">Meus Clientes</h1>
          <p className="text-[#333333]/70">
            Gerencie rotinas e acompanhe o progresso dos clientes
          </p>
        </div>

        {/* Search */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#333333]/50" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar clientes por nome ou email..."
              className="pl-10 border-[#333333]/20 focus:border-[#FA1768] focus:ring-[#FA1768]"
            />
          </div>
        </div>
      </div>

      {/* Client Grid */}
      <div className="flex-1 overflow-auto p-6">
        {isLoadingUsers ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-[#333333]/70">Carregando clientes...</div>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-[#333333]/70">
              Mostrando {filteredClients.length} cliente
              {filteredClients.length !== 1 ? "s" : ""}
            </div>

            <div className="grid grid-cols-3 gap-4">
              {filteredClients.map((client) => (
                <Card
                  key={client.id}
                  className="border-[#333333]/10 hover:border-[#FA1768] transition-colors"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-[#FA1768] text-white">
                            {getInitials(client.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-[#333333] mb-1">{client.name}</h3>
                          <p className="text-sm text-[#333333]/70">
                            {client.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div>
                        {!client.assignedRoutines ||
                        client.assignedRoutines.length === 0 ? (
                          <Badge
                            variant="outline"
                            className="bg-[#E6B949]/10 text-[#E6B949] border-[#E6B949]/30"
                          >
                            Novo Cliente
                          </Badge>
                        ) : getExpiredRoutinesCount(client) > 0 ? (
                          <Badge
                            variant="outline"
                            className="bg-[#FA1768]/10 text-[#FA1768] border-[#FA1768]/30"
                          >
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {getExpiredRoutinesCount(client)} rotina
                            {getExpiredRoutinesCount(client) > 1
                              ? "s"
                              : ""}{" "}
                            expirada
                            {getExpiredRoutinesCount(client) > 1 ? "s" : ""}
                          </Badge>
                        ) : (
                          <div className="h-6"></div>
                        )}
                      </div>

                      {client.trainingDaysPerWeek && (
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-xs text-[#333333]/70 mb-1">
                              Treinos/Semana
                            </p>
                            <p className="text-sm text-[#333333]">
                              {client.trainingDaysPerWeek}x
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() =>
                          onNavigateToReport?.(client.id, client.name)
                        }
                        variant="outline"
                        size="sm"
                        disabled={
                          !client.assignedRoutines ||
                          client.assignedRoutines.length === 0
                        }
                        className="flex-1 border-[#333333]/20 text-[#333333] hover:bg-[#333333]/5 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Gerar Relatório
                      </Button>
                      <Button
                        onClick={() => handleAssignRoutine(client)}
                        variant={
                          client.assignedRoutines &&
                          client.assignedRoutines.length > 0
                            ? "outline"
                            : "default"
                        }
                        size="sm"
                        className={`flex-1 ${
                          client.assignedRoutines &&
                          client.assignedRoutines.length > 0
                            ? "border-[#333333]/20 text-[#333333] hover:bg-[#333333]/5"
                            : "bg-[#FA1768] hover:bg-[#FA1768]/90 text-white"
                        }`}
                      >
                        <Dumbbell className="w-4 h-4 mr-2" />
                        {client.assignedRoutines &&
                        client.assignedRoutines.length > 0
                          ? "Editar Rotinas"
                          : "Atribuir Rotina"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Assign Routine Dialog */}
      <Dialog open={isRoutineDialogOpen} onOpenChange={setIsRoutineDialogOpen}>
        <DialogContent className="max-w-[80vw] sm:max-w-[80vw] w-[80vw] max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="text-[#333333]">
              {isCreatingRoutine ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCancelCreateRoutine}
                    className="h-8 w-8 text-[#333333] hover:bg-[#333333]/5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  Nova Rotina
                </div>
              ) : (
                `${
                  selectedClient?.assignedRoutines &&
                  selectedClient.assignedRoutines.length > 0
                    ? "Editar Rotinas"
                    : "Atribuir Rotina"
                } - ${selectedClient?.name}`
              )}
            </DialogTitle>
            <DialogDescription className="text-[#333333]/70">
              {isCreatingRoutine ? (
                "Preencha as informações da nova rotina"
              ) : (
                <div className="flex flex-col gap-1">
                  <span>
                    {selectedClient?.assignedRoutines &&
                    selectedClient.assignedRoutines.length > 0
                      ? "Edite as rotinas atribuídas ao cliente"
                      : "Selecione rotinas no menu lateral e visualize os exercícios"}
                  </span>
                  {selectedClient?.trainingDaysPerWeek && (
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="outline"
                        className="bg-[#E6B949]/10 text-[#E6B949] border-[#E6B949]/30"
                      >
                        <Dumbbell className="w-3 h-3 mr-1" />
                        {selectedClient.trainingDaysPerWeek}{" "}
                        {selectedClient.trainingDaysPerWeek === 1
                          ? "dia"
                          : "dias"}{" "}
                        por semana
                      </Badge>
                      <span className="text-xs text-[#333333]/60">
                        Planeje {selectedClient.trainingDaysPerWeek}{" "}
                        {selectedClient.trainingDaysPerWeek === 1
                          ? "rotina"
                          : "rotinas"}{" "}
                        para este cliente
                      </span>
                    </div>
                  )}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          {isCreatingRoutine ? (
            // New Routine Form with Exercise Builder
            <div
              className="flex gap-6 overflow-hidden"
              style={{ height: "calc(85vh - 220px)" }}
            >
              {/* Left Column - Routine Info & Exercises */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <ScrollArea className="h-full pr-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="routine-name" className="text-[#333333]">
                        Nome da Rotina
                      </Label>
                      <Input
                        id="routine-name"
                        value={newRoutineName}
                        onChange={(e) => {
                          setNewRoutineName(e.target.value);
                          if (routineNameError) setRoutineNameError("");
                        }}
                        placeholder="ex: Treino A, Upper Body, etc."
                        className={`mt-2 ${
                          routineNameError
                            ? "border-[#FA1768] focus:border-[#FA1768] focus:ring-[#FA1768]"
                            : "border-[#333333]/20 focus:border-[#FA1768] focus:ring-[#FA1768]"
                        }`}
                      />
                      {routineNameError && (
                        <p className="text-sm text-[#FA1768] mt-1">
                          {routineNameError}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label
                        htmlFor="routine-description"
                        className="text-[#333333]"
                      >
                        Descrição
                      </Label>
                      <Textarea
                        id="routine-description"
                        value={newRoutineDescription}
                        onChange={(e) =>
                          setNewRoutineDescription(e.target.value)
                        }
                        placeholder="Descreva o objetivo e foco desta rotina..."
                        rows={3}
                        className="mt-2 border-[#333333]/20 focus:border-[#FA1768] focus:ring-[#FA1768]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="routine-level" className="text-[#333333]">
                        Nível de Dificuldade
                      </Label>
                      <Select
                        value={newRoutineLevel}
                        onValueChange={(
                          value: "Iniciante" | "Intermediário" | "Avançado"
                        ) => setNewRoutineLevel(value)}
                      >
                        <SelectTrigger className="mt-2 border-[#333333]/20 focus:border-[#FA1768] focus:ring-[#FA1768]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Iniciante">Iniciante</SelectItem>
                          <SelectItem value="Intermediário">
                            Intermediário
                          </SelectItem>
                          <SelectItem value="Avançado">Avançado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="pt-4 border-t border-[#333333]/10">
                      <div className="flex items-center justify-between mb-3">
                        <Label className="text-[#333333]">
                          Exercícios da Rotina
                        </Label>
                        <span className="text-sm text-[#333333]/70">
                          {newRoutineExercises.length} exercício(s)
                        </span>
                      </div>

                      {newRoutineExercises.length === 0 ? (
                        <>
                          <Card
                            className={`border-dashed ${
                              routineExercisesError
                                ? "border-[#FA1768]"
                                : "border-[#333333]/10"
                            }`}
                          >
                            <CardContent className="p-6 text-center text-[#333333]/50">
                              <Dumbbell className="w-10 h-10 mx-auto mb-2 opacity-30" />
                              <p className="text-sm">
                                Nenhum exercício adicionado
                              </p>
                              <p className="text-xs mt-1">
                                Selecione exercícios da biblioteca ao lado
                              </p>
                            </CardContent>
                          </Card>
                          {routineExercisesError && (
                            <p className="text-sm text-[#FA1768] mt-2">
                              {routineExercisesError}
                            </p>
                          )}
                        </>
                      ) : (
                        <div className="space-y-3">
                          {newRoutineExercises.map((exercise, index) => (
                            <Card key={index} className="border-[#333333]/10">
                              <CardContent className="p-4">
                                <div className="flex gap-3">
                                  <div className="flex items-center">
                                    <GripVertical className="w-4 h-4 text-[#333333]/30" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-start justify-between mb-3">
                                      <h4 className="text-[#333333]">
                                        {exercise.name}
                                      </h4>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                          removeExerciseFromRoutine(index)
                                        }
                                        className="h-7 w-7 text-[#FA1768] hover:text-[#FA1768] hover:bg-[#FA1768]/10"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 mb-2">
                                      <div>
                                        <label className="block text-xs text-[#333333]/70 mb-1">
                                          Séries
                                        </label>
                                        <Input
                                          type="number"
                                          value={exercise.sets}
                                          onChange={(e) =>
                                            updateRoutineExercise(
                                              index,
                                              "sets",
                                              e.target.value
                                            )
                                          }
                                          className="border-[#333333]/20 focus:border-[#FA1768]"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs text-[#333333]/70 mb-1">
                                          Reps
                                        </label>
                                        <Input
                                          value={exercise.reps}
                                          onChange={(e) =>
                                            updateRoutineExercise(
                                              index,
                                              "reps",
                                              e.target.value
                                            )
                                          }
                                          className="border-[#333333]/20 focus:border-[#FA1768]"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs text-[#333333]/70 mb-1">
                                          Descanso
                                        </label>
                                        <Input
                                          value={exercise.rest}
                                          onChange={(e) =>
                                            updateRoutineExercise(
                                              index,
                                              "rest",
                                              e.target.value
                                            )
                                          }
                                          placeholder="60s"
                                          className="border-[#333333]/20 focus:border-[#FA1768]"
                                        />
                                      </div>
                                    </div>

                                    <div>
                                      <label className="block text-xs text-[#333333]/70 mb-1">
                                        Notas (opcional)
                                      </label>
                                      <Input
                                        value={exercise.notes || ""}
                                        onChange={(e) =>
                                          updateRoutineExercise(
                                            index,
                                            "notes",
                                            e.target.value
                                          )
                                        }
                                        placeholder="Instruções adicionais..."
                                        className="border-[#333333]/20 focus:border-[#FA1768]"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </ScrollArea>
              </div>

              {/* Right Column - Exercise Library */}
              <div className="w-96 border-l border-[#333333]/10 pl-6 flex flex-col overflow-hidden">
                <div className="mb-4 shrink-0">
                  <Label className="text-[#333333] mb-2 block">
                    Biblioteca de Exercícios
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#333333]/50" />
                    <Input
                      value={exerciseSearchTerm}
                      onChange={(e) => setExerciseSearchTerm(e.target.value)}
                      placeholder="Buscar exercícios..."
                      className="pl-9 border-[#333333]/20 focus:border-[#FA1768] focus:ring-[#FA1768]"
                    />
                  </div>
                </div>

                <ScrollArea className="flex-1">
                  {isLoadingExercises ? (
                    <div className="flex items-center justify-center p-8">
                      <Loader2 className="w-6 h-6 animate-spin text-[#FA1768]" />
                    </div>
                  ) : (
                    <div className="space-y-2 pr-4">
                      {filteredExerciseLibrary.map((exercise) => {
                        const isAdded = newRoutineExercises.some(
                          (ex) => ex.id === exercise.id
                        );
                        return (
                          <Card
                            key={exercise.id}
                            className={`cursor-pointer transition-all ${
                              isAdded
                                ? "border-[#E6B949] bg-[#E6B949]/5 opacity-60"
                                : "border-[#333333]/10 hover:border-[#FA1768]/50"
                            }`}
                            onClick={() =>
                              !isAdded && addExerciseToRoutine(exercise)
                            }
                          >
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex-1">
                                  <h4 className="text-sm text-[#333333] mb-1">
                                    {exercise.name}
                                  </h4>
                                  <p className="text-xs text-[#333333]/70">
                                    {exercise.muscleGroup}
                                  </p>
                                </div>
                                {isAdded ? (
                                  <CheckCircle2 className="w-5 h-5 text-[#E6B949] shrink-0" />
                                ) : (
                                  <Plus className="w-5 h-5 text-[#FA1768] shrink-0" />
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          ) : (
            // Routine Selection View (Templates)
            <div
              className="flex gap-6 overflow-hidden"
              style={{ height: "calc(85vh - 220px)" }}
            >
              {/* Left Sidebar - Routine Templates */}
              <div className="w-96 border-r border-[#333333]/10 pr-6 flex flex-col overflow-hidden">
                <div className="mb-4 shrink-0">
                  <div className="mb-3">
                    <Label
                      htmlFor="expiration-date"
                      className="text-[#333333] text-sm"
                    >
                      Data de Expiração
                    </Label>
                    <Input
                      id="expiration-date"
                      type="date"
                      value={expirationDate || ""}
                      onChange={(e) => setExpirationDate(e.target.value)}
                      className="mt-1 border-[#333333]/20 focus:border-[#FA1768] focus:ring-[#FA1768]"
                    />
                  </div>
                  <h3 className="text-[#333333] mb-1">
                    Rotinas Disponíveis (Templates)
                  </h3>
                  <p className="text-xs text-[#333333]/70">
                    {selectedRoutines.length} de {routineTemplates.length}{" "}
                    selecionada(s)
                  </p>
                </div>
                <ScrollArea className="flex-1">
                  <div className="space-y-2 pr-4">
                    {isLoadingRoutines ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                        <span className="ml-2 text-sm text-gray-500">
                          Carregando rotinas...
                        </span>
                      </div>
                    ) : allRoutines.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <AlertCircle className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">
                          Nenhuma rotina disponível. Crie uma nova rotina
                          personalizada.
                        </p>
                      </div>
                    ) : (
                      allRoutines.map((routine) => {
                        const isSelected = selectedRoutines.includes(
                          routine.id
                        );
                        return (
                          <Card
                            key={routine.id}
                            onClick={() => toggleRoutineSelection(routine.id)}
                            className={`cursor-pointer transition-all ${
                              isSelected
                                ? "border-[#FA1768] bg-[#FA1768]/5"
                                : "border-[#333333]/10 hover:border-[#FA1768]/50"
                            }`}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div className="mt-0.5">
                                  {isSelected ? (
                                    <CheckCircle2 className="w-5 h-5 text-[#FA1768]" />
                                  ) : (
                                    <Circle className="w-5 h-5 text-[#333333]/30" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2 mb-2">
                                    <h4 className="text-[#333333]">
                                      {routine.name}
                                    </h4>
                                    <Badge
                                      variant="outline"
                                      className={getLevelBadgeColor(
                                        routine.level
                                      )}
                                    >
                                      {routine.level}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-[#333333]/70 mb-3 line-clamp-2">
                                    {routine.description}
                                  </p>
                                  <div className="flex gap-4 text-sm text-[#333333]/70">
                                    <span>{routine.exercises} exercícios</span>
                                    <span>•</span>
                                    <span>{routine.duration}</span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Right Content - Exercise List */}
              <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                {selectedRoutines.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center text-[#333333]/50">
                      <Dumbbell className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      <p className="text-lg">
                        Selecione rotinas no menu lateral
                      </p>
                      <p className="text-sm mt-2">
                        Os exercícios aparecerão aqui
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-4 pb-3 border-b border-[#333333]/10 shrink-0">
                      <h3 className="text-[#333333]">
                        Exercícios das Rotinas Selecionadas
                      </h3>
                      <p className="text-sm text-[#333333]/70 mt-1">
                        {selectedRoutines.reduce((total, routineId) => {
                          const routine = routineTemplates.find(
                            (r) => r.id === routineId
                          );
                          return total + (routine?.exerciseList.length || 0);
                        }, 0)}{" "}
                        exercícios no total
                      </p>
                    </div>
                    <ScrollArea className="flex-1 min-h-0">
                      <div className="space-y-8 pr-4">
                        {selectedRoutines.map((routineId) => {
                          const routine = routineTemplates.find(
                            (r) => r.id === routineId
                          );
                          if (!routine) return null;

                          return (
                            <div key={routine.id}>
                              <div className="mb-4 pb-3 border-b-2 border-[#FA1768]/20">
                                <div className="flex items-center justify-between mb-2">
                                  <h3 className="text-[#333333] text-lg">
                                    {routine.name}
                                  </h3>
                                  <Badge
                                    variant="outline"
                                    className={getLevelBadgeColor(
                                      routine.level
                                    )}
                                  >
                                    {routine.level}
                                  </Badge>
                                </div>
                                <p className="text-sm text-[#333333]/70">
                                  {routine.description}
                                </p>
                                <div className="flex gap-4 text-sm text-[#333333]/70 mt-2">
                                  <span>{routine.exercises} exercícios</span>
                                  <span>•</span>
                                  <span>{routine.duration}</span>
                                </div>
                              </div>

                              <div className="space-y-3">
                                {routine.exerciseList.map((exercise, index) => (
                                  <Card
                                    key={exercise.id}
                                    className="border-[#333333]/10 hover:border-[#FA1768]/30 transition-colors"
                                  >
                                    <CardContent className="p-4">
                                      <div className="flex items-start gap-4">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#FA1768] text-white shrink-0">
                                          {index + 1}
                                        </div>
                                        <div className="flex-1">
                                          <h4 className="text-[#333333] mb-2">
                                            {exercise.name}
                                          </h4>
                                          <div className="flex gap-6 text-sm text-[#333333]/70">
                                            <span>
                                              <strong className="text-[#333333]">
                                                Séries:
                                              </strong>{" "}
                                              {exercise.sets}
                                            </span>
                                            <span>•</span>
                                            <span>
                                              <strong className="text-[#333333]">
                                                Reps:
                                              </strong>{" "}
                                              {exercise.reps}
                                            </span>
                                            <span>•</span>
                                            <span>
                                              <strong className="text-[#333333]">
                                                Descanso:
                                              </strong>{" "}
                                              {exercise.rest}
                                            </span>
                                          </div>
                                          {exercise.notes && (
                                            <div className="mt-2 px-3 py-2 bg-[#E6B949]/10 border border-[#E6B949]/30 rounded-md">
                                              <p className="text-sm text-[#333333]">
                                                💡 {exercise.notes}
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            {isCreatingRoutine ? (
              <>
                <div className="flex items-center gap-2 mr-auto">
                  <Checkbox
                    id="standard-routine"
                    checked={isStandardRoutine}
                    onCheckedChange={(checked) =>
                      setIsStandardRoutine(checked as boolean)
                    }
                  />
                  <Label
                    htmlFor="standard-routine"
                    className="text-sm text-[#333333] cursor-pointer"
                  >
                    Salvar também como rotina padrão
                  </Label>
                </div>
                <Button
                  onClick={handleCancelCreateRoutine}
                  variant="outline"
                  className="border-[#333333]/20 text-[#333333] hover:bg-[#333333]/5"
                  disabled={isCreatingRoutineMutation}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSaveNewRoutine}
                  className="bg-[#FA1768] hover:bg-[#FA1768]/90 text-white"
                  disabled={isCreatingRoutineMutation}
                >
                  {isCreatingRoutineMutation && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Salvar
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleCreateNewRoutine}
                  variant="outline"
                  className="border-[#333333]/20 text-[#333333] hover:bg-[#333333]/5"
                  disabled={isAssociatingRoutine}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Rotina
                </Button>
                <Button
                  onClick={handleAddRoutines}
                  disabled={
                    selectedRoutines.length === 0 ||
                    isAssociatingRoutine ||
                    isBulkAssigning ||
                    isCreatingRoutineMutation
                  }
                  className="bg-[#FA1768] hover:bg-[#FA1768]/90 text-white disabled:opacity-50"
                >
                  {(isAssociatingRoutine ||
                    isBulkAssigning ||
                    isCreatingRoutineMutation) && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {isAssociatingRoutine ||
                  isBulkAssigning ||
                  isCreatingRoutineMutation
                    ? "Atribuindo..."
                    : selectedClient?.assignedRoutines &&
                      selectedClient.assignedRoutines.length > 0
                    ? "Salvar Alterações"
                    : "Adicionar"}{" "}
                  {selectedRoutines.length > 0 &&
                    !isAssociatingRoutine &&
                    `(${selectedRoutines.length})`}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
