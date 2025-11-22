import axios from "axios";
import z from "zod";

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

api.interceptors.request.use(
  (config) => {
    const storedAuth = localStorage.getItem("auth");
    const auth = storedAuth ? JSON.parse(storedAuth) : null;

    if (auth) {
      config.headers.Authorization = `Bearer ${auth.token}`;
      config.headers["X-Refresh-Token"] = auth.refreshToken;
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
