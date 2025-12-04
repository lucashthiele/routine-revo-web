import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { isTokenValid, isTokenExpiringSoon } from "../lib/token";
import { refreshAccessToken } from "../features/authentication/api/useRefreshToken";

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
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef<boolean>(false);
  
  const [auth, setAuth] = useState<AuthProps | null>(() => {
    const storedAuth = localStorage.getItem("auth");
    if (storedAuth) {
      const parsedAuth = JSON.parse(storedAuth);
      // Validate token on initial load
      if (!isTokenValid(parsedAuth.token)) {
        console.log("Token expired on load, clearing auth");
        localStorage.removeItem("auth");
        localStorage.removeItem("user");
        return null;
      }
      return parsedAuth;
    }
    return null;
  });

  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const isAuthenticated = !!auth?.token && isTokenValid(auth.token);

  // Function to refresh the access token
  const handleTokenRefresh = useCallback(async () => {
    if (!auth?.refreshToken || isRefreshingRef.current) {
      return;
    }

    try {
      isRefreshingRef.current = true;
      console.log("Attempting to refresh access token...");
      
      const newTokens = await refreshAccessToken(auth.refreshToken);
      
      const newAuth = {
        token: newTokens.authToken,
        refreshToken: newTokens.refreshToken,
      };
      
      setAuth(newAuth);
      console.log("Token refreshed successfully");
    } catch (error) {
      console.error("Failed to refresh token:", error);
      // If refresh fails, logout the user
      setAuth(null);
      setUser(null);
      window.location.href = "/login";
    } finally {
      isRefreshingRef.current = false;
    }
  }, [auth?.refreshToken]);

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

  // Periodic token validation and refresh - check every 30 seconds
  useEffect(() => {
    const validateAndRefreshToken = async () => {
      if (!auth?.token) {
        return;
      }

      // If token is already expired, logout
      if (!isTokenValid(auth.token)) {
        console.log("Token expired during validation check, logging out");
        setAuth(null);
        setUser(null);
        window.location.href = "/login";
        return;
      }

      // If token is expiring soon (within 5 minutes), refresh it
      if (isTokenExpiringSoon(auth.token, 5)) {
        console.log("Token expiring soon, attempting refresh...");
        await handleTokenRefresh();
      }
    };

    // Run validation immediately
    validateAndRefreshToken();

    // Set up periodic validation (every 30 seconds)
    intervalRef.current = setInterval(validateAndRefreshToken, 30000);

    // Cleanup on unmount or when auth changes
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [auth, handleTokenRefresh]);

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
