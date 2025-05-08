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
        const idToken = localStorage.getItem("idToken");
        const firebaseUid = localStorage.getItem("firebaseUid");

        if (!idToken || !firebaseUid) {
          setIsLoading(false);
          setIsInitialized(true);
          return;
        }

        console.log("Verificando autenticação com token:", idToken);
        const response = await axiosClient.get("/auth/me", {
          headers: { Authorization: `Bearer ${idToken}` },
        });

        console.log("Resposta da API:", response.data);
        if (response.data.user) {
          setUser(response.data.user);
        } else {
          console.warn(
            "API retornou resposta sem dados de usuário:",
            response.data
          );
          localStorage.removeItem("idToken");
          localStorage.removeItem("firebaseUid");
        }
      } catch (error: any) {
        console.error("Erro ao verificar autenticação:", error);
        if (error.response) {
          console.error("Detalhes do erro:", {
            status: error.response.status,
            data: error.response.data,
          });
        }
        localStorage.removeItem("idToken");
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

        console.log("Resposta do login com Google:", response.data);

        if (response.status === 200 && response.data.user) {
          // Usar o token retornado pelo backend
          localStorage.setItem("idToken", response.data.idToken);
          localStorage.setItem("firebaseUid", response.data.firebaseUid);
          setUser(response.data.user);
          router.push("/");
        }
      } catch (error: unknown) {
        const axiosError = error as {
          response?: { status: number; data?: any };
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
      // Firebase authentication
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      // Backend authentication
      const response = await axiosClient.post("/auth/login", {
        email: credentials.email,
        password: credentials.password,
      });

      console.log("Resposta do login com email:", response.data);

      if (response.status === 200) {
        // Usar o token retornado pelo backend
        localStorage.setItem("idToken", response.data.idToken);
        localStorage.setItem("firebaseUid", response.data.firebaseUid);
        setUser(response.data.user);
        router.push("/");
      }
    } catch (error: any) {
      console.error("Erro no login:", error);
      if (error.response) {
        console.error("Detalhes do erro:", {
          status: error.response.status,
          data: error.response.data,
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
      // O backend é responsável por criar o usuário no Firebase
      // Não precisamos criar o usuário no Firebase aqui
      const response = await axiosClient.post("/auth/register", {
        email: credentials.email,
        password: credentials.password,
        name: credentials.name,
      });

      console.log("Resposta do registro:", response.data);

      if (response.status === 201) {
        // Usar o token e firebaseUid retornados pelo backend
        localStorage.setItem(
          "idToken",
          response.data.idToken || response.data.user.idToken
        );
        localStorage.setItem("firebaseUid", response.data.firebaseUid);
        setUser(response.data.user);
        router.push("/");
      }
    } catch (error: any) {
      console.error("Erro no registro:", error);
      if (error.response) {
        console.error("Detalhes do erro:", {
          status: error.response.status,
          data: error.response.data,
        });
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    auth
      .signOut()
      .then(() => {
        localStorage.removeItem("idToken");
        localStorage.removeItem("firebaseUid");
        setUser(null);
        router.push("/");
      })
      .catch((error: unknown) => {
        console.error("Erro ao fazer logout:" + (error as Error).message);
      });
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
