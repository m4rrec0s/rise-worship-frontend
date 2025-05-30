"use client";

import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../config/firebase";
import axiosClient from "../config/axios-client";
import {
  User,
  LoginCredentials,
  RegisterCredentials,
  GoogleAuthData,
} from "../types/user";
import { LoadingIcon } from "../components/loading-icon";

interface AuthContextProps {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  tempGoogleData: GoogleAuthData | null;
  loginWithGoogle: () => Promise<void>;
  loginWithEmailAndPassword: (credentials: LoginCredentials) => Promise<void>;
  registerWithEmailAndPassword: (
    credentials: RegisterCredentials
  ) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  sessionLogin: (sessionToken: string) => Promise<void>;
  logoutAll: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [tempGoogleData, setTempGoogleData] = useState<GoogleAuthData | null>(
    null
  );

  const isAuthenticated = !!user;

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const sessionToken = localStorage.getItem("sessionToken");
        const firebaseUid = localStorage.getItem("firebaseUid");

        if (!sessionToken || !firebaseUid) {
          setIsLoading(false);
          setIsInitialized(true);
          return;
        }

        const response = await axiosClient.get("/auth/me", {
          headers: { Authorization: `Bearer ${sessionToken}` },
        });

        if (response.data.user) {
          setUser(response.data.user);
        } else {
          console.warn(
            "API retornou resposta sem dados de usuário:",
            response.data
          );
          localStorage.removeItem("sessionToken");
          localStorage.removeItem("firebaseUid");
        }
      } catch (error: unknown) {
        console.error("Erro ao verificar autenticação:", error);
        const errorWithResponse = error as {
          response?: { status: number; data: unknown };
        };
        if (errorWithResponse.response) {
          console.error("Detalhes do erro:", {
            status: errorWithResponse.response.status,
            data: errorWithResponse.response.data,
          });
        }
        localStorage.removeItem("sessionToken");
        localStorage.removeItem("firebaseUid");
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    checkAuthStatus();
  }, []);

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      const firebaseUid = result.user.uid;
      const email = result.user.email;
      const name = result.user.displayName;
      const imageUrl = result.user.photoURL;

      const googleData = { idToken, firebaseUid, email, name, imageUrl };

      try {
        const response = await axiosClient.post(
          "/auth/google-login",
          googleData
        );

        if (response.status === 200 && response.data.user) {
          localStorage.setItem("sessionToken", response.data.sessionToken);
          localStorage.setItem("firebaseUid", response.data.firebaseUid);
          setUser(response.data.user);
          router.push("/");
        }
      } catch (error: unknown) {
        const axiosError = error as {
          response?: { status: number; data?: unknown };
        };
        console.error(
          "Erro na resposta do backend:",
          axiosError.response?.data
        );

        if (axiosError.response && axiosError.response.status === 404) {
          setTempGoogleData(googleData);
          router.push("/register");
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error("Erro no login com Google:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithEmailAndPassword = async (
    credentials: LoginCredentials
  ): Promise<void> => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      const response = await axiosClient.post("/auth/login", {
        email: credentials.email,
        password: credentials.password,
      });

      if (response.status === 200) {
        localStorage.setItem("sessionToken", response.data.sessionToken);
        localStorage.setItem("firebaseUid", response.data.firebaseUid);
        setUser(response.data.user);
        router.push("/");
      }
    } catch (error: unknown) {
      console.error("Erro no login:", error);
      const errorWithResponse = error as {
        response?: { status: number; data: unknown };
      };
      if (errorWithResponse.response) {
        console.error("Detalhes do erro:", {
          status: errorWithResponse.response.status,
          data: errorWithResponse.response.data,
        });
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const registerWithEmailAndPassword = async (
    credentials: RegisterCredentials
  ): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await axiosClient.post("/auth/register", {
        email: credentials.email,
        password: credentials.password,
        name: credentials.name,
      });

      if (response.status === 201) {
        localStorage.setItem("sessionToken", response.data.sessionToken);
        localStorage.setItem("firebaseUid", response.data.firebaseUid);
        setUser(response.data.user);
        router.push("/");
      }
    } catch (error: unknown) {
      console.error("Erro no registro:", error);
      const errorWithResponse = error as {
        response?: { status: number; data: unknown };
      };
      if (errorWithResponse.response) {
        console.error("Detalhes do erro:", {
          status: errorWithResponse.response.status,
          data: errorWithResponse.response.data,
        });
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const sessionLogin = async (sessionToken: string): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await axiosClient.post("/auth/session-login", {
        sessionToken,
      });

      if (response.status === 200 && response.data.user) {
        localStorage.setItem("sessionToken", response.data.sessionToken);
        localStorage.setItem("firebaseUid", response.data.firebaseUid);
        setUser(response.data.user);
      }
    } catch (error: unknown) {
      console.error("Erro no login com sessão:", error);
      localStorage.removeItem("sessionToken");
      localStorage.removeItem("firebaseUid");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const sessionToken = localStorage.getItem("sessionToken");

      if (sessionToken) {
        await axiosClient.post("/auth/logout", { sessionToken });
      }

      await auth.signOut();

      localStorage.removeItem("sessionToken");
      localStorage.removeItem("firebaseUid");

      setUser(null);

      router.push("/");
    } catch (error: unknown) {
      console.error("Erro ao fazer logout:", error);

      localStorage.removeItem("sessionToken");
      localStorage.removeItem("firebaseUid");
      setUser(null);
      router.push("/");
    }
  };

  const logoutAll = async (): Promise<void> => {
    try {
      await axiosClient.post("/auth/logout-all");

      await auth.signOut();

      localStorage.removeItem("sessionToken");
      localStorage.removeItem("firebaseUid");

      setUser(null);

      router.push("/");
    } catch (error: unknown) {
      console.error("Erro ao fazer logout de todas as sessões:", error);

      localStorage.removeItem("sessionToken");
      localStorage.removeItem("firebaseUid");
      setUser(null);
      router.push("/");
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingIcon />
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        tempGoogleData,
        loginWithGoogle,
        loginWithEmailAndPassword,
        registerWithEmailAndPassword,
        logout,
        updateUser,
        sessionLogin,
        logoutAll,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
