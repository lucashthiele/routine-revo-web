import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { DashboardLayout } from "../components/DashboardLayout";
import { ClientReport as ClientReportComponent } from "../features/reports/components/ClientReport";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function ClientReportPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Get client name from query params (passed during navigation)
  const clientName = searchParams.get("name") || "Cliente";
  
  useDocumentTitle(`Relatório - ${clientName}`);

  // TODO - Back Navigation
  // Action: Navigate back to client management or previous page
  // Could also use navigate(-1) for browser history back
  const handleBack = () => {
    navigate("/clients");
  };

  if (!clientId) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-[#333333]/70">ID do cliente não encontrado</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <ClientReportComponent
        clientId={clientId}
        clientName={clientName}
        onBack={handleBack}
      />
    </DashboardLayout>
  );
}

