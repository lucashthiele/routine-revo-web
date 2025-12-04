import axios from "axios";
import z from "zod";
import { isTokenValid, isTokenExpiringSoon } from "../lib/token";
import { refreshAccessToken } from "../features/authentication/api/useRefreshToken";

const envSchema = z.object({
  VITE_API_BASE_URL: z.url(),
});

const env = envSchema.safeParse(import.meta.env);

if (!env.success) {
  console.error("Invalid environment variables:", z.treeifyError(env.error));
  throw new Error("Invalid environment variables");
}

const API_URL = env.data.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Track if we're currently refreshing to prevent multiple simultaneous refresh attempts
let isRefreshing = false;

api.interceptors.request.use(
  async (config) => {
    const storedAuth = localStorage.getItem("auth");
    const auth = storedAuth ? JSON.parse(storedAuth) : null;

    if (auth) {
      // Don't refresh on the refresh endpoint itself
      const isRefreshEndpoint = config.url?.includes('/auth/refresh');
      const isLoginEndpoint = config.url?.includes('/auth/login');

      if (!isRefreshEndpoint && !isLoginEndpoint) {
        // If token is already expired, logout
        if (!isTokenValid(auth.token)) {
          console.log("Token expired before request, clearing auth and redirecting");
          localStorage.removeItem("auth");
          localStorage.removeItem("user");
          window.location.href = "/login";
          return Promise.reject(new Error("Token expired"));
        }

        // If token is expiring soon (within 2 minutes), refresh it proactively
        if (isTokenExpiringSoon(auth.token, 2) && !isRefreshing) {
          try {
            isRefreshing = true;
            console.log("Token expiring soon, refreshing before request...");
            
            const newTokens = await refreshAccessToken(auth.refreshToken);
            
            const newAuth = {
              token: newTokens.authToken,
              refreshToken: newTokens.refreshToken,
            };
            
            // Update localStorage with new tokens
            localStorage.setItem("auth", JSON.stringify(newAuth));
            
            // Use the new token for this request
            config.headers.Authorization = `Bearer ${newTokens.authToken}`;
            config.headers["X-Refresh-Token"] = newTokens.refreshToken;
            
            console.log("Token refreshed successfully before request");
          } catch (error) {
            console.error("Failed to refresh token before request:", error);
            localStorage.removeItem("auth");
            localStorage.removeItem("user");
            window.location.href = "/login";
            return Promise.reject(new Error("Token refresh failed"));
          } finally {
            isRefreshing = false;
          }
        } else {
          // Token is still valid, use it normally
          config.headers.Authorization = `Bearer ${auth.token}`;
          config.headers["X-Refresh-Token"] = auth.refreshToken;
        }
      } else {
        // For refresh/login endpoints, just add the tokens
        config.headers.Authorization = `Bearer ${auth.token}`;
        config.headers["X-Refresh-Token"] = auth.refreshToken;
      }
    }

    return config;
  },
  (err) => {
    return Promise.reject(err);
  }
);

api.interceptors.response.use(
  (response) => response,
  (err) => {
    // Only redirect on 401 if it's not a login attempt
    const isLoginEndpoint = err.config?.url?.includes('/auth/login');
    
    if (err.response?.status === 401 && !isLoginEndpoint) {
      localStorage.removeItem("auth");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
