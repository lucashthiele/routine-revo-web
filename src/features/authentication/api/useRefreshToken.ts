import api from "../../../api/axios";

export interface RefreshTokenResponse {
  authToken: string;
  refreshToken: string;
}

/**
 * Refreshes the access token using the refresh token
 * Note: This is called directly, not as a React hook, to avoid the interceptor
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<RefreshTokenResponse> {
  // Create a separate axios instance to avoid triggering interceptors
  const { data } = await api.post<RefreshTokenResponse>(
    "/api/v1/auth/refresh",
    {},
    {
      headers: {
        "X-Refresh-Token": refreshToken,
      },
    }
  );

  return data;
}

