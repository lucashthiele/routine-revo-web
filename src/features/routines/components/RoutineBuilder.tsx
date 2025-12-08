import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { Card, CardContent } from "../../../components/ui/card";
import { Label } from "../../../components/ui/label";
import { Badge } from "../../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/alert-dialog";
import {
  Search,
  Plus,
  Trash2,
  GripVertical,
  Edit2,
  FileText,
  FolderOpen,
  Loader2,
} from "lucide-react";
import { ImageWithFallback } from "../../../components/ImageWithFallback";
import { useAuth } from "../../../providers/AuthProvider";
import {
  useRoutines,
  useExercises,
  useCreateRoutine,
  useUpdateRoutine,
  useDeleteRoutine,
  type RoutineResponse,
  type RoutineItemRequest,
  type ExerciseResponse,
} from "../api";
import { getMuscleGroupLabel, type MuscleGroup } from "../types";

interface RoutineExerciseLocal {
  id: string;
  exerciseId: string;
  name: string;
  muscleGroup: string;
  equipment: string;
  imageUrl?: string;
  sets: string;
  reps: string;
  restTime: string;
  notes: string;
  sequenceOrder: number;
}

export function RoutineBuilder() {
  const { user } = useAuth();

  // API Queries
  const {
    data: routinesData,
    isLoading: routinesLoading,
    refetch: refetchRoutines,
  } = useRoutines({
    routineType: "TEMPLATE",
    size: 100,
  });

  const {
    data: exercisesData,
    isLoading: exercisesLoading,
  } = useExercises({
    size: 100,
  });

  // API Mutations
  const createRoutineMutation = useCreateRoutine();
  const updateRoutineMutation = useUpdateRoutine();
  const deleteRoutineMutation = useDeleteRoutine();

  // Local State
  const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null);
  const [routineExercises, setRoutineExercises] = useState<RoutineExerciseLocal[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [routineSearchTerm, setRoutineSearchTerm] = useState("");
  const [routineName, setRoutineName] = useState("");
  const [routineDescription, setRoutineDescription] = useState("");
  const [manageDialogOpen, setManageDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [routineToDelete, setRoutineToDelete] = useState<string | null>(null);

  // Derived state
  const savedRoutines = routinesData?.routines ?? [];
  const exerciseLibrary = exercisesData?.exercises ?? [];

  const addExercise = (exercise: ExerciseResponse) => {
    const newExercise: RoutineExerciseLocal = {
      id: `temp-${Date.now()}`,
      exerciseId: exercise.id,
      name: exercise.name,
      muscleGroup: getMuscleGroupLabel(exercise.muscleGroup),
      equipment: exercise.equipment ?? "",
      imageUrl: exercise.imageUrl,
      sets: "3",
      reps: "10",
      restTime: "60s",
      notes: "",
      sequenceOrder: routineExercises.length + 1,
    };
    setRoutineExercises([...routineExercises, newExercise]);
  };

  const removeExercise = (index: number) => {
    const updated = routineExercises.filter((_, i) => i !== index);
    // Update sequence orders
    const reordered = updated.map((ex, i) => ({
      ...ex,
      sequenceOrder: i + 1,
    }));
    setRoutineExercises(reordered);
  };

  const updateExercise = (
    index: number,
    field: keyof RoutineExerciseLocal,
    value: string
  ) => {
    const updated = [...routineExercises];
    updated[index] = { ...updated[index], [field]: value };
    setRoutineExercises(updated);
  };

  const filteredExercises = exerciseLibrary.filter((ex) =>
    ex.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const loadRoutineForEditing = (routine: RoutineResponse) => {
    setEditingRoutineId(routine.id);
    setRoutineName(routine.name);
    setRoutineDescription(routine.description ?? "");
    
    // Convert API routine items to local format
    const localExercises: RoutineExerciseLocal[] = routine.items.map((item) => ({
      id: item.id,
      exerciseId: item.exerciseId,
      name: item.exerciseName,
      muscleGroup: "", // Will be populated from exercise library if needed
      equipment: "",
      imageUrl: item.exerciseImageUrl,
      sets: String(item.sets),
      reps: item.reps,
      restTime: item.restTime ?? "60s",
      notes: "",
      sequenceOrder: item.sequenceOrder,
    }));
    
    setRoutineExercises(localExercises);
    setManageDialogOpen(false);
  };

  const createNewRoutine = () => {
    setEditingRoutineId(null);
    setRoutineName("");
    setRoutineDescription("");
    setRoutineExercises([]);
  };

  const confirmDeleteRoutine = (routineId: string) => {
    setRoutineToDelete(routineId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteRoutine = async () => {
    if (!routineToDelete) return;

    try {
      await deleteRoutineMutation.mutateAsync(routineToDelete);
      toast.success("Rotina excluída com sucesso!");
      
      if (editingRoutineId === routineToDelete) {
        createNewRoutine();
      }
      
      setDeleteDialogOpen(false);
      setRoutineToDelete(null);
      refetchRoutines();
    } catch (error) {
      console.error("Error deleting routine:", error);
      toast.error("Erro ao excluir rotina. Tente novamente.");
    }
  };

  const filteredRoutines = savedRoutines.filter(
    (routine) =>
      routine.name.toLowerCase().includes(routineSearchTerm.toLowerCase()) ||
      (routine.description ?? "")
        .toLowerCase()
        .includes(routineSearchTerm.toLowerCase())
  );

  const handleSaveRoutine = async () => {
    if (!routineName.trim()) {
      toast.error("Por favor, informe o nome da rotina.");
      return;
    }

    if (routineExercises.length === 0) {
      toast.error("Por favor, adicione pelo menos um exercício à rotina.");
      return;
    }

    if (!user?.id) {
      toast.error("Erro de autenticação. Por favor, faça login novamente.");
      return;
    }

    // Convert local exercises to API format
    const items: RoutineItemRequest[] = routineExercises.map((ex, index) => ({
      exerciseId: ex.exerciseId,
      sets: parseInt(ex.sets) || 3,
      reps: ex.reps || "10",
      load: undefined,
      restTime: ex.restTime || "60s",
      sequenceOrder: index + 1,
    }));

    try {
      if (editingRoutineId) {
        // Update existing routine
        await updateRoutineMutation.mutateAsync({
          routineId: editingRoutineId,
          data: {
            name: routineName,
            description: routineDescription || undefined,
            items,
          },
        });
        toast.success(`Rotina "${routineName}" atualizada com sucesso!`);
      } else {
        // Create new routine
        await createRoutineMutation.mutateAsync({
          name: routineName,
          description: routineDescription || undefined,
          creatorId: user.id,
          routineType: "TEMPLATE",
          items,
        });
        toast.success(`Rotina "${routineName}" criada com sucesso!`);
        createNewRoutine();
      }
      
      refetchRoutines();
    } catch (error) {
      console.error("Error saving routine:", error);
      toast.error("Erro ao salvar rotina. Tente novamente.");
    }
  };

  const getDifficultyColor = (muscleGroup: MuscleGroup) => {
    // Use muscle group for badge color variety
    const colorMap: Record<string, string> = {
      CHEST: "bg-red-100 text-red-800 border-red-200",
      BACK: "bg-blue-100 text-blue-800 border-blue-200",
      SHOULDERS: "bg-orange-100 text-orange-700 border-orange-200",
      BICEPS: "bg-purple-100 text-purple-800 border-purple-200",
      TRICEPS: "bg-indigo-100 text-indigo-800 border-indigo-200",
      LEGS: "bg-green-100 text-green-800 border-green-200",
      GLUTES: "bg-pink-100 text-pink-800 border-pink-200",
      ABS: "bg-yellow-100 text-yellow-800 border-yellow-200",
      CARDIO: "bg-cyan-100 text-cyan-800 border-cyan-200",
      FULL_BODY: "bg-[#FA1768]/20 text-[#FA1768] border-[#FA1768]/30",
    };
    return colorMap[muscleGroup] || "bg-[#333333]/10 text-[#333333] border-[#333333]/20";
  };

  const isSaving = createRoutineMutation.isPending || updateRoutineMutation.isPending;
  const isDeleting = deleteRoutineMutation.isPending;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#333333]/10 p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-[#333333] text-xl font-semibold mb-1">
                  {editingRoutineId
                    ? "Editar Rotina Padrão"
                    : "Criar Rotina Padrão"}
                </h1>
                <p className="text-[#333333]/70">
                  {editingRoutineId
                    ? `Editando: ${routineName}`
                    : "Crie e personalize rotinas de treino para seus clientes"}
                </p>
              </div>
              {editingRoutineId && (
                <Badge
                  variant="outline"
                  className="bg-[#FA1768]/10 text-[#FA1768] border-[#FA1768]/30"
                >
                  Modo Edição
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <Dialog open={manageDialogOpen} onOpenChange={setManageDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="border-[#333333]/20 text-[#333333] hover:bg-[#333333]/5"
                >
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Gerenciar Rotinas ({savedRoutines.length})
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh]">
                <DialogHeader>
                  <DialogTitle className="text-[#333333]">
                    Gerenciar Rotinas Padrão
                  </DialogTitle>
                  <DialogDescription className="text-[#333333]/70">
                    Visualize, edite ou exclua suas rotinas de treino
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#333333]/40" />
                    <Input
                      placeholder="Buscar rotinas..."
                      value={routineSearchTerm}
                      onChange={(e) => setRoutineSearchTerm(e.target.value)}
                      className="pl-10 border-[#333333]/20 focus:border-[#FA1768] focus:ring-[#FA1768]"
                    />
                  </div>

                  {/* Routines List */}
                  <div className="space-y-2 max-h-[450px] overflow-y-auto pr-2">
                    {routinesLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-[#FA1768]" />
                        <span className="ml-2 text-[#333333]/70">Carregando rotinas...</span>
                      </div>
                    ) : filteredRoutines.length === 0 ? (
                      <div className="text-center py-8 text-[#333333]/70">
                        {routineSearchTerm
                          ? "Nenhuma rotina encontrada"
                          : "Nenhuma rotina criada ainda"}
                      </div>
                    ) : (
                      filteredRoutines.map((routine) => (
                        <Card
                          key={routine.id}
                          className={`border transition-all ${
                            editingRoutineId === routine.id
                              ? "border-[#FA1768] bg-[#FA1768]/5"
                              : "border-[#333333]/10"
                          }`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <FileText className="w-5 h-5 text-[#FA1768] flex-shrink-0" />
                                  <h4 className="text-[#333333] font-medium truncate">
                                    {routine.name}
                                  </h4>
                                  {editingRoutineId === routine.id && (
                                    <Badge
                                      variant="outline"
                                      className="bg-[#FA1768] text-white border-[#FA1768] flex-shrink-0"
                                    >
                                      Editando
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-[#333333]/70 mb-3 line-clamp-2">
                                  {routine.description || "Sem descrição"}
                                </p>
                                <div className="flex items-center gap-3">
                                  <Badge
                                    variant="outline"
                                    className="bg-[#E6B949]/20 text-[#E6B949] border-[#E6B949]/30"
                                  >
                                    Template
                                  </Badge>
                                  <span className="text-sm text-[#333333]/70">
                                    {routine.itemCount} exercícios
                                  </span>
                                </div>
                              </div>
                              <div className="flex gap-2 flex-shrink-0">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => loadRoutineForEditing(routine)}
                                  className="border-[#E6B949]/30 text-[#E6B949] hover:bg-[#E6B949]/10"
                                >
                                  <Edit2 className="w-4 h-4 mr-1" />
                                  Editar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    confirmDeleteRoutine(routine.id)
                                  }
                                  className="border-[#FA1768]/30 text-[#FA1768] hover:bg-[#FA1768]/10"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {editingRoutineId && (
              <Button
                onClick={createNewRoutine}
                variant="outline"
                className="border-[#333333]/20 text-[#333333] hover:bg-[#333333]/5"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Rotina
              </Button>
            )}
            <Button
              onClick={handleSaveRoutine}
              disabled={isSaving}
              className="bg-[#FA1768] hover:bg-[#FA1768]/90 text-white"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                editingRoutineId ? "Salvar Alterações" : "Publicar Rotina"
              )}
            </Button>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-[#333333]">
                Confirmar Exclusão
              </AlertDialogTitle>
              <AlertDialogDescription className="text-[#333333]/70">
                Tem certeza que deseja excluir esta rotina? Esta ação não pode
                ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-[#333333]/20 text-[#333333]">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteRoutine}
                disabled={isDeleting}
                className="bg-[#FA1768] hover:bg-[#FA1768]/90 text-white"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Excluindo...
                  </>
                ) : (
                  "Excluir"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Two Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column - Routine Being Built */}
        <div className="w-1/2 border-r border-[#333333]/10 flex flex-col">
          <div className="p-6 border-b border-[#333333]/10 space-y-4">
            <div>
              <Label htmlFor="routine-name" className="text-[#333333]">
                Nome da Rotina
              </Label>
              <Input
                id="routine-name"
                value={routineName}
                onChange={(e) => setRoutineName(e.target.value)}
                className="mt-2 border-[#333333]/20 focus:border-[#FA1768] focus:ring-[#FA1768]"
                placeholder="ex: Treino A, Upper Body, etc."
              />
            </div>

            <div>
              <Label htmlFor="routine-description" className="text-[#333333]">
                Descrição
              </Label>
              <Textarea
                id="routine-description"
                value={routineDescription}
                onChange={(e) => setRoutineDescription(e.target.value)}
                placeholder="Descreva o objetivo e foco desta rotina..."
                rows={3}
                className="mt-2 border-[#333333]/20 focus:border-[#FA1768] focus:ring-[#FA1768]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-auto p-6">
            {routineExercises.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-[#333333]/50">
                  <Dumbbell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Nenhum exercício adicionado ainda</p>
                  <p className="text-sm">
                    Selecione exercícios da biblioteca à direita
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {routineExercises.map((exercise, index) => (
                  <Card key={exercise.id} className="p-4 border-[#333333]/10">
                    <div className="flex gap-4">
                      <div className="flex items-start gap-2">
                        <GripVertical className="w-5 h-5 text-[#333333]/30 mt-1" />
                        <div className="w-16 h-16 bg-[#333333]/5 rounded-lg overflow-hidden flex-shrink-0">
                          <ImageWithFallback
                            src={exercise.imageUrl}
                            alt={exercise.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      <div className="flex-1">
                        <h4 className="text-[#333333] font-medium mb-1">
                          {exercise.name}
                        </h4>
                        <p className="text-sm text-[#333333]/70 mb-3">
                          {exercise.muscleGroup || "Exercício"}
                        </p>

                        <div className="grid grid-cols-3 gap-3 mb-3">
                          <div>
                            <label className="block text-xs text-[#333333]/70 mb-1">
                              Séries
                            </label>
                            <Input
                              type="number"
                              value={exercise.sets}
                              onChange={(e) =>
                                updateExercise(index, "sets", e.target.value)
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
                                updateExercise(index, "reps", e.target.value)
                              }
                              className="border-[#333333]/20 focus:border-[#FA1768]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-[#333333]/70 mb-1">
                              Descanso
                            </label>
                            <Input
                              value={exercise.restTime}
                              onChange={(e) =>
                                updateExercise(index, "restTime", e.target.value)
                              }
                              placeholder="60s"
                              className="border-[#333333]/20 focus:border-[#FA1768]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs text-[#333333]/70 mb-1">
                            Observações
                          </label>
                          <Textarea
                            value={exercise.notes}
                            onChange={(e) =>
                              updateExercise(index, "notes", e.target.value)
                            }
                            className="border-[#333333]/20 focus:border-[#FA1768] min-h-[60px]"
                            placeholder="Adicione observações..."
                          />
                        </div>
                      </div>

                      <Button
                        onClick={() => removeExercise(index)}
                        variant="ghost"
                        size="icon"
                        className="text-[#FA1768] hover:bg-[#FA1768]/10 flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Exercise Library */}
        <div className="w-1/2 flex flex-col">
          <div className="p-6 border-b border-[#333333]/10">
            <h3 className="text-[#333333] font-semibold mb-4">
              Biblioteca de Exercícios
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#333333]/50" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar exercícios..."
                className="pl-10 border-[#333333]/20 focus:border-[#FA1768] focus:ring-[#FA1768]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-auto p-6">
            {exercisesLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-[#FA1768]" />
                <span className="ml-2 text-[#333333]/70">Carregando exercícios...</span>
              </div>
            ) : filteredExercises.length === 0 ? (
              <div className="flex items-center justify-center h-full text-[#333333]/50">
                <p>Nenhum exercício encontrado</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {filteredExercises.map((exercise) => (
                  <Card
                    key={exercise.id}
                    className="overflow-hidden border-[#333333]/10 hover:border-[#FA1768] transition-colors cursor-pointer group"
                    onClick={() => addExercise(exercise)}
                  >
                    <div className="aspect-video bg-[#333333]/5 overflow-hidden">
                      <ImageWithFallback
                        src={exercise.imageUrl}
                        alt={exercise.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="p-4">
                      <h4 className="text-[#333333] font-medium mb-2">
                        {exercise.name}
                      </h4>

                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge
                          variant="outline"
                          className={`${getDifficultyColor(exercise.muscleGroup)} text-xs`}
                        >
                          {getMuscleGroupLabel(exercise.muscleGroup)}
                        </Badge>
                      </div>

                      {exercise.equipment && (
                        <p className="text-xs text-[#333333]/70 mb-3">
                          Equipamento: {exercise.equipment}
                        </p>
                      )}

                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          addExercise(exercise);
                        }}
                        size="sm"
                        className="w-full bg-[#FA1768] hover:bg-[#FA1768]/90 text-white"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Adicionar à Rotina
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Dumbbell({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 8h10M7 12h10M7 16h10M3 8v8a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2z"
      />
    </svg>
  );
}
