import { DashboardLayout } from "../components/DashboardLayout";
import { ClientManagement as ClientManagementComponent } from "../features/clients/components/ClientManagement";
import { toast } from "sonner";
// import { useNavigate } from "react-router-dom";

export default function ClientManagementPage() {
  // const navigate = useNavigate();

  // Navigate to Client Report
  // API Available: GET /api/v1/reports/members/{memberId}
  // When ClientReport page is created, uncomment navigation
  const handleNavigateToReport = (clientId: string, clientName: string) => {
    console.log("Navigate to report", { clientId, clientName });
    // navigate(`/clients/${clientId}/report`);
    toast.info(
      `Página de relatório em desenvolvimento. API disponível em GET /api/v1/reports/members/${clientId}`
    );
  };

  return (
    <DashboardLayout>
      <ClientManagementComponent onNavigateToReport={handleNavigateToReport} />
    </DashboardLayout>
  );
}
