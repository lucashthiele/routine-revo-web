import { DashboardLayout } from "../components/DashboardLayout";
import { ExerciseLibrary } from "../features/exercises/components/ExerciseLibrary";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function ExerciseLibraryPage() {
  useDocumentTitle("Exercícios");

  return (
    <DashboardLayout>
      <ExerciseLibrary />
    </DashboardLayout>
  );
}

