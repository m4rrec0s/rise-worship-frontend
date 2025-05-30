import { useCallback } from "react";
import axiosClient from "../config/axios-client";
import { User } from "../types/user";

export interface SessionTokenResponse {
  sessionToken: string;
  firebaseUid: string;
  user: User;
  message?: string;
}

export interface ExtendedTokenResponse {
  customToken: string;
  sessionToken: string;
  message: string;
}

export const useSessionToken = () => {
  const getStoredSessionToken = useCallback(() => {
    return localStorage.getItem("sessionToken");
  }, []);

  const setStoredSessionToken = useCallback((token: string) => {
    localStorage.setItem("sessionToken", token);
  }, []);

  const removeStoredSessionToken = useCallback(() => {
    localStorage.removeItem("sessionToken");
    localStorage.removeItem("firebaseUid");
  }, []);

  const loginWithSession = useCallback(
    async (sessionToken: string): Promise<SessionTokenResponse> => {
      const response = await axiosClient.post("/auth/session-login", {
        sessionToken,
      });
      return response.data;
    },
    []
  );

  const createExtendedToken = useCallback(
    async (durationInDays: number = 30): Promise<ExtendedTokenResponse> => {
      const response = await axiosClient.post("/auth/extended-token", {
        durationInDays,
      });
      return response.data;
    },
    []
  );

  const logoutSession = useCallback(
    async (sessionToken?: string): Promise<void> => {
      const token = sessionToken || getStoredSessionToken();
      if (token) {
        await axiosClient.post("/auth/logout", { sessionToken: token });
      }
    },
    [getStoredSessionToken]
  );

  const logoutAllSessions = useCallback(async (): Promise<void> => {
    await axiosClient.post("/auth/logout-all");
  }, []);

  const isSessionValid = useCallback(async (): Promise<boolean> => {
    try {
      const sessionToken = getStoredSessionToken();
      if (!sessionToken) return false;

      const response = await axiosClient.get("/auth/me", {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });

      return response.status === 200 && response.data.user;
    } catch (error) {
      return false;
    }
  }, [getStoredSessionToken]);

  return {
    getStoredSessionToken,
    setStoredSessionToken,
    removeStoredSessionToken,
    loginWithSession,
    createExtendedToken,
    logoutSession,
    logoutAllSessions,
    isSessionValid,
  };
};

export default useSessionToken;
