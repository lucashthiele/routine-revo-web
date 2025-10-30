import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  type ReactNode,
} from "react";

interface User {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "COACH";
}

interface AuthProps {
  token: string;
  refreshToken: string;
}

interface AuthProviderProps {
  children: ReactNode;
}

interface AuthContextType {
  auth: AuthProps | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (auth: AuthProps, user?: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
  const [auth, setAuth] = useState<AuthProps | null>(() => {
    const storedAuth = localStorage.getItem("auth");
    return storedAuth ? JSON.parse(storedAuth) : null;
  });

  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const isAuthenticated = !!auth?.token;

  useEffect(() => {
    console.log("Auth state changed:", { auth, user, isAuthenticated });
    if (auth) {
      console.log("Setting localStorage...");
      localStorage.setItem("auth", JSON.stringify(auth));
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }
      console.log("localStorage set successfully");
    } else {
      localStorage.removeItem("auth");
      localStorage.removeItem("user");
    }
  }, [auth, user, isAuthenticated]);

  const login = useCallback((newAuth: AuthProps, newUser?: User) => {
    console.log("Login function called with:", { newAuth, newUser });
    setAuth(newAuth);
    setUser(newUser || null);
  }, []);

  const logout = useCallback(() => {
    setAuth(null);
    setUser(null);
  }, []);

  const contextValue = useMemo(
    () => ({
      auth,
      user,
      isAuthenticated,
      login,
      logout,
    }),
    [auth, user, isAuthenticated, login, logout]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
