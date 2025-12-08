import { useMemo } from "react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { Badge } from "../../../components/ui/badge";
import {
  Calendar,
  TrendingUp,
  Activity,
  Award,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useMemberReport, useUser } from "../../clients/api/useClientsApi";
import type { WorkoutSessionResponse, WorkoutStatus, WorkoutStatistics } from "../types";

// =============================================================================
// Props Interface
// =============================================================================

interface ClientReportProps {
  clientId: string;
  clientName: string;
  onBack: () => void;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Derive workout status from duration
 * - completed: durationMinutes > 0
 * - missed: durationMinutes === 0
 */
function deriveWorkoutStatus(durationMinutes: number): WorkoutStatus {
  return durationMinutes > 0 ? "completed" : "missed";
}

function getStatusIcon(status: WorkoutStatus) {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    case "missed":
      return <XCircle className="w-5 h-5 text-[#FA1768]" />;
    default:
      return null;
  }
}

function getStatusBadgeClass(status: WorkoutStatus): string {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800 border-green-200";
    case "missed":
      return "bg-[#FA1768]/20 text-[#FA1768] border-[#FA1768]/30";
    default:
      return "bg-[#333333]/10 text-[#333333] border-[#333333]/20";
  }
}

function getStatusLabel(status: WorkoutStatus): string {
  switch (status) {
    case "completed":
      return "Concluído";
    case "missed":
      return "Perdido";
    default:
      return status;
  }
}

function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDuration(minutes: number): string {
  if (minutes === 0) return "0 min";
  return `${minutes} min`;
}

function getUserInitials(name: string): string {
  const names = name.split(" ");
  if (names.length >= 2) {
    return `${names[0][0]}${names[1][0]}`.toUpperCase();
  }
  return names[0]?.substring(0, 2).toUpperCase() || "??";
}

function calculateStatistics(
  workouts: WorkoutSessionResponse[],
  adherenceRate: number
): WorkoutStatistics {
  const completedWorkouts = workouts.filter((w) => w.durationMinutes > 0).length;
  const missedWorkouts = workouts.filter((w) => w.durationMinutes === 0).length;
  
  // Calculate current streak (consecutive completed workouts from most recent)
  let currentStreak = 0;
  const sortedWorkouts = [...workouts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  for (const workout of sortedWorkouts) {
    if (workout.durationMinutes > 0) {
      currentStreak++;
    } else {
      break;
    }
  }
  
  return {
    adherenceRate: Math.round(adherenceRate),
    totalWorkouts: workouts.length,
    completedWorkouts,
    missedWorkouts,
    currentStreak,
  };
}

function getStatusBadge(status: "ACTIVE" | "INACTIVE" | "PENDING") {
  switch (status) {
    case "ACTIVE":
      return { label: "Cliente Ativo", className: "bg-green-100 text-green-800 border-green-200" };
    case "INACTIVE":
      return { label: "Inativo", className: "bg-[#333333]/10 text-[#333333] border-[#333333]/20" };
    case "PENDING":
      return { label: "Pendente", className: "bg-[#E6B949]/20 text-[#E6B949] border-[#E6B949]/30" };
    default:
      return { label: status, className: "bg-[#333333]/10 text-[#333333] border-[#333333]/20" };
  }
}

// =============================================================================
// Component
// =============================================================================

export function ClientReport({ clientId, clientName, onBack }: ClientReportProps) {
  // Fetch report data from API
  const {
    data: reportData,
    isLoading: isLoadingReport,
    error: reportError,
  } = useMemberReport(clientId);

  // Fetch user details for extended profile
  const {
    data: userData,
    isLoading: isLoadingUser,
  } = useUser(clientId);

  const isLoading = isLoadingReport || isLoadingUser;

  // Calculate statistics from API data
  const statistics = useMemo(() => {
    if (!reportData) return null;
    return calculateStatistics(reportData.workoutHistory, reportData.adherenceRate);
  }, [reportData]);

  // Loading state
  if (isLoading) {
    return (
      <div className="h-full overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-[#333333]/10 p-6">
          <div className="flex items-center gap-4">
            <Button
              onClick={onBack}
              variant="ghost"
              size="icon"
              className="text-[#333333]"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-[#333333] mb-1">Relatório do Cliente</h1>
              <p className="text-[#333333]/70">Carregando...</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-[#FA1768]" />
        </div>
      </div>
    );
  }

  // Error state
  if (reportError || !reportData) {
    return (
      <div className="h-full overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-[#333333]/10 p-6">
          <div className="flex items-center gap-4">
            <Button
              onClick={onBack}
              variant="ghost"
              size="icon"
              className="text-[#333333]"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-[#333333] mb-1">Relatório do Cliente</h1>
              <p className="text-[#333333]/70">Erro ao carregar dados</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <AlertCircle className="w-12 h-12 text-[#FA1768]" />
          <p className="text-[#333333]/70">
            Não foi possível carregar o relatório do cliente.
          </p>
          <Button onClick={onBack} variant="outline">
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  const userStatus = userData?.status || "ACTIVE";
  const statusBadge = getStatusBadge(userStatus);

  return (
    <div className="h-full overflow-auto">
      {/* Header */}
      <div className="bg-white border-b border-[#333333]/10 p-6">
        <div className="flex items-center gap-4">
          <Button
            onClick={onBack}
            variant="ghost"
            size="icon"
            className="text-[#333333]"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-[#333333] mb-1">Relatório do Cliente</h1>
            <p className="text-[#333333]/70">
              Acompanhe o progresso e adesão aos treinos
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Client Profile */}
        <Card className="mb-6 border-[#333333]/10">
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="bg-[#FA1768] text-white text-2xl">
                  {getUserInitials(reportData.memberName || clientName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="mb-4">
                  <h2 className="text-[#333333] mb-1">{reportData.memberName}</h2>
                  <p className="text-[#333333]/70">{reportData.memberEmail}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge
                      variant="outline"
                      className={statusBadge.className}
                    >
                      {statusBadge.label}
                    </Badge>
                    {userData?.lastWorkoutDate && (
                      <Badge
                        variant="outline"
                        className="border-[#333333]/20 text-[#333333]"
                      >
                        Último treino: {formatDate(userData.lastWorkoutDate)}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-[#333333]/70 mb-1">
                      Dias de Treino
                    </p>
                    <p className="text-[#333333]">
                      {userData?.workoutPerWeek ?? "-"} dias/semana
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[#333333]/70 mb-1">Taxa de Adesão</p>
                    <p className="text-[#333333]">
                      {Math.round(reportData.adherenceRate)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[#333333]/70 mb-1">Rotinas Ativas</p>
                    <p className="text-[#333333]">
                      {userData?.assignedRoutines?.filter(r => !r.isExpired).length ?? 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        {statistics && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            <Card className="border-[#333333]/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-[#333333]/70 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Taxa de Adesão
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl text-[#333333] mb-1">
                  {statistics.adherenceRate}%
                </div>
                <p className="text-sm text-[#333333]/70">Taxa geral</p>
              </CardContent>
            </Card>

            <Card className="border-[#333333]/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-[#333333]/70 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Total de Treinos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl text-[#333333] mb-1">
                  {statistics.totalWorkouts}
                </div>
                <p className="text-sm text-[#333333]/70">Histórico completo</p>
              </CardContent>
            </Card>

            <Card className="border-[#333333]/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-[#333333]/70 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Concluídos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl text-[#333333] mb-1">
                  {statistics.completedWorkouts}
                </div>
                <p className="text-sm text-green-600">
                  {statistics.missedWorkouts} perdidos
                </p>
              </CardContent>
            </Card>

            <Card className="border-[#333333]/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-[#333333]/70 flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Sequência Atual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl text-[#333333] mb-1">{statistics.currentStreak}</div>
                <p className="text-sm text-[#333333]/70">treinos consecutivos</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Workout History */}
        <Card className="border-[#333333]/10">
          <CardHeader className="border-b border-[#333333]/10">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[#333333] flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Histórico de Treinos
              </CardTitle>
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 border-[#333333]/20"
                    disabled
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 border-[#333333]/20"
                    disabled
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {reportData.workoutHistory.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-[#333333]/70">
                  Nenhum treino registrado ainda.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#333333]/10">
                {reportData.workoutHistory.map((session) => {
                  const status = deriveWorkoutStatus(session.durationMinutes);
                  return (
                    <div
                      key={session.workoutSessionId}
                      className="p-4 hover:bg-[#333333]/5 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          {getStatusIcon(status)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="text-[#333333]">{session.routineName}</h4>
                            <Badge
                              variant="outline"
                              className={getStatusBadgeClass(status)}
                            >
                              {getStatusLabel(status)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-[#333333]/70">
                            <span>{formatDate(session.date)}</span>
                            {status !== "missed" && (
                              <>
                                <span>•</span>
                                <span>{formatDuration(session.durationMinutes)}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-[#333333]/30" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
