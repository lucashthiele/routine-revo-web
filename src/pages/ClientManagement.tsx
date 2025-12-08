import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "../components/DashboardLayout";
import { ClientManagement as ClientManagementComponent } from "../features/clients/components/ClientManagement";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function ClientManagementPage() {
  useDocumentTitle("Clientes");
  const navigate = useNavigate();

  // Navigate to Client Report
  // API Available: GET /api/v1/reports/members/{memberId}
  const handleNavigateToReport = (clientId: string, clientName: string) => {
    navigate(`/clients/${clientId}/report?name=${encodeURIComponent(clientName)}`);
  };

  return (
    <DashboardLayout>
      <ClientManagementComponent onNavigateToReport={handleNavigateToReport} />
    </DashboardLayout>
  );
}
