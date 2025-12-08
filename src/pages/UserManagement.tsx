import { DashboardLayout } from "../components/DashboardLayout";
import { UserManagement } from "../features/users";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function UserManagementPage() {
  useDocumentTitle("Usuários");

  return (
    <DashboardLayout>
      <UserManagement />
    </DashboardLayout>
  );
}

