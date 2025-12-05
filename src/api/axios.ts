import axios from "axios";
import z from "zod";
import { isTokenValid, isTokenExpiringSoon } from "../lib/token";
import { refreshAccessToken } from "../features/authentication/api/useRefreshToken";

// Extend axios config to include metadata for logging
declare module "axios" {
  export interface InternalAxiosRequestConfig {
    metadata?: {
      startTime: Date;
    };
  }
}

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
    // Store request start time for logging
    config.metadata = { startTime: new Date() };

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

    // Log the request
    console.group(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    console.log("📍 URL:", `${config.baseURL}${config.url}`);
    console.log("🔧 Method:", config.method?.toUpperCase());
    if (config.params && Object.keys(config.params).length > 0) {
      console.log("🔍 Query Params:", config.params);
    }
    if (config.data) {
      console.log("📦 Request Body:", config.data);
    }
    console.log("📋 Headers:", {
      ...config.headers,
      Authorization: config.headers.Authorization ? "Bearer [HIDDEN]" : undefined,
      "X-Refresh-Token": config.headers["X-Refresh-Token"] ? "[HIDDEN]" : undefined,
    });
    console.groupEnd();

    return config;
  },
  (err) => {
    console.error("❌ Request Error:", err);
    return Promise.reject(err);
  }
);

api.interceptors.response.use(
  (response) => {
    // Calculate request duration
    const duration = response.config.metadata?.startTime
      ? new Date().getTime() - response.config.metadata.startTime.getTime()
      : 0;

    // Log the response
    console.group(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`);
    console.log("📍 URL:", `${response.config.baseURL}${response.config.url}`);
    console.log("📊 Status:", response.status, response.statusText);
    console.log("⏱️ Duration:", `${duration}ms`);
    console.log("📦 Response Data:", response.data);
    console.log("📋 Response Headers:", response.headers);
    console.groupEnd();

    return response;
  },
  (err) => {
    // Calculate request duration
    const duration = err.config?.metadata?.startTime
      ? new Date().getTime() - err.config.metadata.startTime.getTime()
      : 0;

    // Log the error response
    console.group(`❌ API Error: ${err.config?.method?.toUpperCase()} ${err.config?.url}`);
    console.log("📍 URL:", `${err.config?.baseURL}${err.config?.url}`);
    console.log("📊 Status:", err.response?.status, err.response?.statusText);
    console.log("⏱️ Duration:", `${duration}ms`);
    if (err.response?.data) {
      console.log("📦 Error Data:", err.response.data);
    }
    console.log("🔍 Error Message:", err.message);
    console.log("📋 Error Config:", {
      method: err.config?.method,
      url: err.config?.url,
      params: err.config?.params,
      data: err.config?.data,
    });
    console.groupEnd();

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
