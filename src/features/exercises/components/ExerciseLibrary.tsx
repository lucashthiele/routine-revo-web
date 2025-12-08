import { useState, useRef } from "react";
import { AxiosError } from "axios";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Card } from "../../../components/ui/card";
import { Search, Plus, Filter, Upload, X, Loader2, Trash2 } from "lucide-react";

interface ApiError {
  error?: string;
  message?: string;
  status?: number;
  path?: string;
  timestamp?: string;
}
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { Badge } from "../../../components/ui/badge";
import { ImageWithFallback } from "../../../components/ImageWithFallback";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
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
import { toast } from "sonner";
import {
  useExercises,
  useCreateExercise,
  useUpdateExercise,
  useDeleteExercise,
} from "../api/useExercisesApi";
import type { ExerciseResponse } from "../api/exercisesApi";
import {
  type MuscleGroup,
  MUSCLE_GROUPS,
  muscleGroupDisplayNames,
  displayNameToMuscleGroup,
  getMuscleGroupDisplayName,
  EQUIPMENT_OPTIONS,
} from "../types";

// Filter options for the UI
const muscleGroupFilters = ["Todos", ...Object.values(muscleGroupDisplayNames)];

export function ExerciseLibrary() {
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState("Todos");
  const [page, setPage] = useState(0);
  const pageSize = 20;

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExercise, setEditingExercise] =
    useState<ExerciseResponse | null>(null);

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] =
    useState<ExerciseResponse | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formMuscleGroup, setFormMuscleGroup] = useState("");
  const [formEquipment, setFormEquipment] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formImageFile, setFormImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Build API query params
  const queryParams = {
    name: searchTerm || undefined,
    muscleGroup:
      selectedMuscleGroup !== "Todos"
        ? displayNameToMuscleGroup[selectedMuscleGroup]
        : undefined,
    page,
    size: pageSize,
  };

  // API Hooks
  const {
    data: exercisesData,
    isLoading,
    isError,
    error,
  } = useExercises(queryParams);

  const createExerciseMutation = useCreateExercise();
  const updateExerciseMutation = useUpdateExercise();
  const deleteExerciseMutation = useDeleteExercise();

  const exercises = exercisesData?.exercises ?? [];
  const totalExercises = exercisesData?.total ?? 0;
  const totalPages = exercisesData?.totalPages ?? 0;

  const getMuscleGroupBadgeColor = (muscleGroup: MuscleGroup) => {
    const colors: Record<MuscleGroup, string> = {
      CHEST: "bg-red-100 text-red-800 border-red-200",
      BACK: "bg-blue-100 text-blue-800 border-blue-200",
      SHOULDERS: "bg-purple-100 text-purple-800 border-purple-200",
      BICEPS: "bg-green-100 text-green-800 border-green-200",
      TRICEPS: "bg-emerald-100 text-emerald-800 border-emerald-200",
      LEGS: "bg-orange-100 text-orange-700 border-orange-200",
      GLUTES: "bg-pink-100 text-pink-800 border-pink-200",
      ABS: "bg-yellow-100 text-yellow-800 border-yellow-200",
      CARDIO: "bg-cyan-100 text-cyan-800 border-cyan-200",
      FULL_BODY: "bg-[#FA1768]/20 text-[#FA1768] border-[#FA1768]/30",
    };
    return colors[muscleGroup] || "bg-[#333333]/10 text-[#333333] border-[#333333]/20";
  };

  const openCreateModal = () => {
    setEditingExercise(null);
    setFormName("");
    setFormMuscleGroup("");
    setFormEquipment("");
    setFormDescription("");
    setFormImageFile(null);
    setImagePreview("");
    setIsModalOpen(true);
  };

  const openEditModal = (exercise: ExerciseResponse) => {
    setEditingExercise(exercise);
    setFormName(exercise.name);
    setFormMuscleGroup(getMuscleGroupDisplayName(exercise.muscleGroup));
    setFormEquipment(exercise.equipment || "");
    setFormDescription(exercise.description || "");
    setFormImageFile(null);
    setImagePreview(exercise.imageUrl || "");
    setIsModalOpen(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        setFormImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        toast.error("Por favor, selecione um arquivo de imagem válido");
      }
    }
  };

  const handleRemoveImage = () => {
    setFormImageFile(null);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSaveExercise = async () => {
    if (!formName || !formMuscleGroup) {
      toast.error("Por favor, preencha os campos obrigatórios");
      return;
    }

    // Convert display name to enum value
    const muscleGroupEnum = displayNameToMuscleGroup[formMuscleGroup];
    if (!muscleGroupEnum) {
      toast.error("Grupo muscular inválido");
      return;
    }

    const exerciseData = {
      name: formName,
      muscleGroup: muscleGroupEnum,
      equipment: formEquipment || undefined,
      description: formDescription || undefined,
    };

    try {
      if (editingExercise) {
        // Update existing exercise
        await updateExerciseMutation.mutateAsync({
          exerciseId: editingExercise.id,
          data: exerciseData,
          imageFile: formImageFile || undefined,
        });
        toast.success(`Exercício "${formName}" atualizado com sucesso!`);
      } else {
        // Create new exercise
        await createExerciseMutation.mutateAsync({
          data: exerciseData,
          imageFile: formImageFile || undefined,
        });
        toast.success(`Novo exercício "${formName}" criado com sucesso!`);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error saving exercise:", err);
      
      const axiosError = err as AxiosError<ApiError>;
      const statusCode = axiosError.response?.status;
      
      // For 4xx errors, show the specific error message from the API
      if (statusCode && statusCode >= 400 && statusCode < 500) {
        const errorMessage =
          axiosError.response?.data?.message ||
          axiosError.response?.data?.error ||
          (editingExercise ? "Erro ao atualizar exercício" : "Erro ao criar exercício");
        toast.error(errorMessage);
      } else {
        toast.error(
          editingExercise
            ? "Erro ao atualizar exercício. Tente novamente."
            : "Erro ao criar exercício. Tente novamente."
        );
      }
    }
  };

  const handleDeleteClick = (exercise: ExerciseResponse) => {
    setExerciseToDelete(exercise);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!exerciseToDelete) return;

    try {
      await deleteExerciseMutation.mutateAsync(exerciseToDelete.id);
      toast.success(`Exercício "${exerciseToDelete.name}" excluído com sucesso!`);
      setDeleteDialogOpen(false);
      setExerciseToDelete(null);
    } catch (err) {
      console.error("Error deleting exercise:", err);
      
      const axiosError = err as AxiosError<ApiError>;
      const statusCode = axiosError.response?.status;
      
      // For 4xx errors, show the specific error message from the API
      if (statusCode && statusCode >= 400 && statusCode < 500) {
        const errorMessage =
          axiosError.response?.data?.message ||
          axiosError.response?.data?.error ||
          "Erro ao excluir exercício";
        toast.error(errorMessage);
      } else {
        toast.error("Erro ao excluir exercício. Tente novamente.");
      }
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const isSaving =
    createExerciseMutation.isPending || updateExerciseMutation.isPending;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#333333]/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-[#333333] mb-1">
              Biblioteca de Exercícios
            </h1>
            <p className="text-[#333333]/70">
              Gerencie seu banco completo de exercícios
            </p>
          </div>
          <Button
            onClick={openCreateModal}
            className="bg-[#FA1768] hover:bg-[#FA1768]/90 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Exercício
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#333333]/50" />
            <Input
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0); // Reset to first page on search
              }}
              placeholder="Buscar exercícios por nome..."
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
                Grupo Muscular:{" "}
                <span className="ml-1 text-[#FA1768]">
                  {selectedMuscleGroup}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {muscleGroupFilters.map((group) => (
                <DropdownMenuItem
                  key={group}
                  onClick={() => {
                    setSelectedMuscleGroup(group);
                    setPage(0); // Reset to first page on filter change
                  }}
                >
                  {group}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Exercise Grid */}
      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-[#FA1768]" />
            <span className="ml-2 text-[#333333]/70">
              Carregando exercícios...
            </span>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-red-500 mb-2">Erro ao carregar exercícios</p>
            <p className="text-[#333333]/70 text-sm">
              {error instanceof Error ? error.message : "Tente novamente"}
            </p>
          </div>
        ) : exercises.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-[#333333]/70 mb-2">Nenhum exercício encontrado</p>
            <p className="text-[#333333]/50 text-sm">
              {searchTerm || selectedMuscleGroup !== "Todos"
                ? "Tente ajustar os filtros"
                : "Clique em 'Adicionar Exercício' para começar"}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-[#333333]/70">
              Mostrando {exercises.length} de {totalExercises} exercício
              {totalExercises !== 1 ? "s" : ""}
            </div>

            <div className="grid grid-cols-4 gap-4">
              {exercises.map((exercise) => (
                <Card
                  key={exercise.id}
                  className="overflow-hidden border-[#333333]/10 hover:border-[#FA1768] transition-colors group"
                >
                  <div className="aspect-video bg-[#333333]/5 overflow-hidden relative">
                    {exercise.imageUrl ? (
                      <ImageWithFallback
                        src={exercise.imageUrl}
                        alt={exercise.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#333333]/30">
                        Sem imagem
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h4 className="text-[#333333] font-medium mb-2 line-clamp-1">
                      {exercise.name}
                    </h4>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge
                        variant="outline"
                        className={`${getMuscleGroupBadgeColor(exercise.muscleGroup)} text-xs`}
                      >
                        {getMuscleGroupDisplayName(exercise.muscleGroup)}
                      </Badge>
                    </div>

                    {exercise.equipment && (
                      <p className="text-xs text-[#333333]/70 mb-3 line-clamp-1">
                        Equipamento: {exercise.equipment}
                      </p>
                    )}

                    {exercise.description && (
                      <p className="text-xs text-[#333333]/50 mb-3 line-clamp-2">
                        {exercise.description}
                      </p>
                    )}

                    <div className="flex gap-2">
                      <Button
                        onClick={() => openEditModal(exercise)}
                        variant="outline"
                        size="sm"
                        className="flex-1 border-[#FA1768] text-[#FA1768] hover:bg-[#FA1768] hover:text-white"
                      >
                        Editar
                      </Button>
                      <Button
                        onClick={() => handleDeleteClick(exercise)}
                        variant="outline"
                        size="sm"
                        className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 0}
                  className="border-[#333333]/20"
                >
                  Anterior
                </Button>
                <span className="text-sm text-[#333333]/70 px-4">
                  Página {page + 1} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages - 1}
                  className="border-[#333333]/20"
                >
                  Próxima
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de Criar/Editar Exercício */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-[#333333]">
              {editingExercise
                ? "Editar Exercício"
                : "Adicionar Novo Exercício"}
            </DialogTitle>
            <DialogDescription className="text-[#333333]/70">
              {editingExercise
                ? "Atualize as informações do exercício abaixo"
                : "Preencha as informações do novo exercício"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Nome do Exercício */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[#333333]">
                Nome do Exercício *
              </Label>
              <Input
                id="name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Ex: Supino Reto com Barra"
                className="border-[#333333]/20 focus:border-[#FA1768] focus:ring-[#FA1768]"
              />
            </div>

            {/* Grupo Muscular */}
            <div className="space-y-2">
              <Label htmlFor="muscleGroup" className="text-[#333333]">
                Grupo Muscular *
              </Label>
              <Select
                value={formMuscleGroup}
                onValueChange={setFormMuscleGroup}
              >
                <SelectTrigger className="border-[#333333]/20 focus:border-[#FA1768] focus:ring-[#FA1768]">
                  <SelectValue placeholder="Selecione o grupo muscular" />
                </SelectTrigger>
                <SelectContent>
                  {MUSCLE_GROUPS.map((mg) => (
                    <SelectItem key={mg} value={muscleGroupDisplayNames[mg]}>
                      {muscleGroupDisplayNames[mg]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Equipamento */}
            <div className="space-y-2">
              <Label htmlFor="equipment" className="text-[#333333]">
                Equipamento
              </Label>
              <Select value={formEquipment} onValueChange={setFormEquipment}>
                <SelectTrigger className="border-[#333333]/20 focus:border-[#FA1768] focus:ring-[#FA1768]">
                  <SelectValue placeholder="Selecione o equipamento (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {EQUIPMENT_OPTIONS.map((eq) => (
                    <SelectItem key={eq} value={eq}>
                      {eq}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-[#333333]">
                Descrição
              </Label>
              <Input
                id="description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Descrição do exercício (opcional)"
                className="border-[#333333]/20 focus:border-[#FA1768] focus:ring-[#FA1768]"
              />
            </div>

            {/* Imagem do Exercício */}
            <div className="space-y-2">
              <Label className="text-[#333333]">Imagem do Exercício</Label>

              {/* Upload Area */}
              {!imagePreview ? (
                <div>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#333333]/20 rounded-lg p-8 text-center cursor-pointer hover:border-[#FA1768] hover:bg-[#FA1768]/5 transition-colors"
                  >
                    <Upload className="w-8 h-8 text-[#333333]/50 mx-auto mb-3" />
                    <p className="text-sm text-[#333333] mb-1">
                      Clique para fazer upload da imagem
                    </p>
                    <p className="text-xs text-[#333333]/60">
                      PNG, JPG ou WEBP (máx. 5MB)
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Preview da Imagem */}
                  <div className="relative aspect-video bg-[#333333]/5 rounded-lg overflow-hidden group/preview">
                    <ImageWithFallback
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        type="button"
                        onClick={handleRemoveImage}
                        variant="destructive"
                        size="sm"
                        className="bg-[#FA1768] hover:bg-[#FA1768]/90"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Remover Imagem
                      </Button>
                    </div>
                  </div>

                  {/* Image Info */}
                  <div className="flex items-center justify-between text-xs text-[#333333]/70 bg-[#333333]/5 p-3 rounded-lg">
                    <span>
                      {formImageFile
                        ? `Arquivo: ${formImageFile.name}`
                        : "Imagem atual"}
                    </span>
                    <Button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs text-[#FA1768] hover:text-[#FA1768] hover:bg-[#FA1768]/10"
                    >
                      Alterar
                    </Button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="border-[#333333]/20 text-[#333333]"
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveExercise}
              className="bg-[#FA1768] hover:bg-[#FA1768]/90 text-white"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : editingExercise ? (
                "Atualizar Exercício"
              ) : (
                "Criar Exercício"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Exercício</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o exercício "
              {exerciseToDelete?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteExerciseMutation.isPending ? (
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
  );
}
