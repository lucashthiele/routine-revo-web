import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  exp: number;
  iat: number;
  sub: string;
  [key: string]: unknown;
}

/**
 * Validates if a JWT token is expired
 * @param token - JWT token string
 * @returns true if token is valid (not expired), false otherwise
 */
export function isTokenValid(token: string | null | undefined): boolean {
  if (!token) {
    return false;
  }

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    
    // Get current time in seconds (JWT exp is in seconds)
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Check if token has expiration and if it's still valid
    if (!decoded.exp) {
      console.warn("Token does not have an expiration time");
      return false;
    }
    
    // Token is valid if expiration time is in the future
    return decoded.exp > currentTime;
  } catch (error) {
    console.error("Error decoding token:", error);
    return false;
  }
}

/**
 * Gets the expiration time of a JWT token in milliseconds
 * @param token - JWT token string
 * @returns expiration time in milliseconds, or null if invalid
 */
export function getTokenExpiration(token: string | null | undefined): number | null {
  if (!token) {
    return null;
  }

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    return decoded.exp ? decoded.exp * 1000 : null; // Convert to milliseconds
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
}

/**
 * Checks if token will expire within the specified minutes
 * @param token - JWT token string
 * @param minutes - number of minutes to check ahead
 * @returns true if token expires within the specified time
 */
export function isTokenExpiringSoon(
  token: string | null | undefined,
  minutes: number = 5
): boolean {
  const expiration = getTokenExpiration(token);
  if (!expiration) {
    return true;
  }

  const timeUntilExpiration = expiration - Date.now();
  const minutesInMs = minutes * 60 * 1000;
  
  return timeUntilExpiration <= minutesInMs;
}

/**
 * Decodes a JWT token and returns the payload
 * @param token - JWT token string
 * @returns decoded token payload or null if invalid
 */
export function decodeToken(token: string | null | undefined): DecodedToken | null {
  if (!token) {
    return null;
  }

  try {
    return jwtDecode<DecodedToken>(token);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
}

