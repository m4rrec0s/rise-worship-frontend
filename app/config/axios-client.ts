import axios from "axios";

const API_URL = "http://localhost:8080/api";

const axiosClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adicionar o token de autenticação em todas as requisições
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("idToken");

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratamento global de erros
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se o token expirou ou é inválido (401)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("idToken");
      localStorage.removeItem("firebaseUid");

      // Redirecionar para login se necessário
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
