import { DashboardLayout } from "../components/DashboardLayout";
import { RoutineBuilder } from "../features/routines/components/RoutineBuilder";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function RoutineBuilderPage() {
  useDocumentTitle("Rotinas");

  return (
    <DashboardLayout>
      <RoutineBuilder />
    </DashboardLayout>
  );
}

