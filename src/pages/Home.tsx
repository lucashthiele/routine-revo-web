import { DashboardLayout } from "../components/DashboardLayout";
import { useAuth } from "../providers/AuthProvider";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function HomePage() {
  useDocumentTitle("Dashboard");
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-700">
          Bem-vindo, {user?.name || "Usuário"}!
        </p>
        <div className="mt-6 bg-gray-50 border border-gray-200">
          <p className="text-sm text-gray-600">
            Esta é a página inicial do Routine Revo. Use a barra lateral para navegar entre as seções.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
