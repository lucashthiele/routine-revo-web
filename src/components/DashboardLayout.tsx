import { type ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Logo from "./Logo";
import {
  Dumbbell,
  Users,
  LayoutGrid,
  FileText,
  LogOut,
} from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "../providers/AuthProvider";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  // Map role from ADMIN/COACH to admin/instructor
  const userRole = user?.role === "ADMIN" ? "admin" : "instructor";

  // Get user initials from name
  const getUserInitials = (name: string) => {
    const names = name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return names[0]?.substring(0, 2).toUpperCase() || "??";
  };

  const navigationItems = [
    {
      id: "client-management",
      label: "Meus Clientes",
      icon: Users,
      path: "/clients",
    },
    {
      id: "routine-builder",
      label: "Gerenciar Rotinas",
      icon: Dumbbell,
      path: "/routines",
    },
    {
      id: "exercise-library",
      label: "Biblioteca de Exercícios",
      icon: LayoutGrid,
      path: "/exercises",
    },
    ...(userRole === "admin"
      ? [
          {
            id: "user-management",
            label: "Gerenciar Usuários",
            icon: FileText,
            path: "/users",
          },
        ]
      : []),
  ];

  // TODO - Implement logout functionality
  // Action: Log the user out and redirect to login page
  // Should call AuthProvider's logout() function
  // Should redirect to /login after logout
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // TODO - Navigation handlers
  // These paths (/clients, /routines, /exercises, /users) need to be:
  // 1. Created as route definitions in /src/routes/index.tsx
  // 2. Created as page components in /src/pages/
  // 3. Each page should use this DashboardLayout as a wrapper
  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-72 bg-[#333333] text-white flex flex-col">
        {/* Logo and Brand */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10">
              <Logo />
            </div>
            <div>
              <h2 className="text-white font-semibold">Routine Revo</h2>
              <p className="text-xs text-white/70">
                {userRole === "admin" ? "Portal do Admin" : "Portal do Treinador"}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                    isActive
                      ? "bg-[#FA1768] text-white"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[#FA1768] flex items-center justify-center text-white text-sm font-semibold">
              {user?.name ? getUserInitials(user.name) : "??"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">
                {user?.name || "Usuário"}
              </p>
              <p className="text-xs text-white/70">
                {userRole === "admin" ? "Administrador" : "Treinador"}
              </p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            className="w-full bg-[#FA1768] hover:bg-[#FA1768]/90 text-white"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-white">{children}</main>
    </div>
  );
}

