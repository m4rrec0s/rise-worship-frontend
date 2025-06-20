import axiosClient from "../config/axios-client";
import { LoginCredentials, RegisterCredentials } from "../types/user";
import { useMemo, useState, useCallback, useEffect } from "react";

interface CacheType {
  users: unknown | null;
  groups: unknown | null;
  setlists: unknown | null;
  musics: unknown | null;
  loading: boolean;
  [key: string]: unknown | null;
}

interface AddUserToGroupData {
  userId: string;
  permission: string;
}

interface MusicExistsProps {
  groupId: string;
  title: string;
  author: string;
}

class ApiService {
  private static globalCache: CacheType = {
    users: null,
    groups: null,
    setlists: null,
    musics: null,
    loading: false,
  };

  static getGlobalCache() {
    return ApiService.globalCache;
  }

  clearAllCache() {
    Object.keys(ApiService.globalCache).forEach((key) => {
      ApiService.globalCache[key] = null;
    });
  }

  clearCache(key: string) {
    if (key in ApiService.globalCache) {
      ApiService.globalCache[key] = null;
    }
  }

  // ===== AUTENTICAÇÃO =====
  register = async (userData: RegisterCredentials) => {
    const response = await axiosClient.post("/auth/register", userData);
    return response.data;
  };

  login = async (credentials: LoginCredentials) => {
    const response = await axiosClient.post("/auth/login", credentials);
    return response.data;
  };

  googleLogin = async (tokenId: string) => {
    const response = await axiosClient.post("/auth/google-login", { tokenId });
    return response.data;
  };

  getMe = async () => {
    const response = await axiosClient.get("/auth/me");
    return response.data;
  };

  // ===== GERENCIAMENTO DE SESSÕES =====
  sessionLogin = async (sessionToken: string) => {
    const response = await axiosClient.post("/auth/session-login", {
      sessionToken,
    });
    return response.data;
  };

  createExtendedToken = async (durationInDays: number = 30) => {
    const response = await axiosClient.post("/auth/extended-token", {
      durationInDays,
    });
    return response.data;
  };

  logout = async (sessionToken: string) => {
    const response = await axiosClient.post("/auth/logout", { sessionToken });
    return response.data;
  };

  logoutAll = async () => {
    const response = await axiosClient.post("/auth/logout-all");
    return response.data;
  };

  // ===== VERIFICAÇÃO E MIGRAÇÃO DE TOKENS =====
  checkAndMigrateTokens = async () => {
    const oldIdToken = localStorage.getItem("idToken");
    const sessionToken = localStorage.getItem("sessionToken");

    if (oldIdToken && !sessionToken) {
      try {
        const response = await axiosClient.get("/auth/me", {
          headers: { Authorization: `Bearer ${oldIdToken}` },
        });

        if (response.data.user) {
          const extendedResponse = await axiosClient.post(
            "/auth/extended-token",
            {
              durationInDays: 90,
            },
            {
              headers: { Authorization: `Bearer ${oldIdToken}` },
            }
          );

          localStorage.setItem(
            "sessionToken",
            extendedResponse.data.sessionToken
          );
          localStorage.removeItem("idToken");

          return extendedResponse.data;
        }
      } catch (error) {
        console.warn("Não foi possível migrar o token antigo:", error);
        localStorage.removeItem("idToken");
      }
    }

    return null;
  };

  // ===== USUÁRIOS =====
  updateUser = async (userData: FormData) => {
    const response = await axiosClient.put("/user/profile", userData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    this.clearCache("users");
    return response.data;
  };

  getAllUsers = async () => {
    if (ApiService.globalCache.users) return ApiService.globalCache.users;
    const response = await axiosClient.get("/users");
    ApiService.globalCache.users = response.data;
    return response.data;
  };

  getUsersByEmail = async (email: string) => {
    const cacheKey = `users_email_${email}`;
    if (ApiService.globalCache[cacheKey])
      return ApiService.globalCache[cacheKey];

    const response = await axiosClient.get(
      `/users/search?email=${encodeURIComponent(email)}`
    );
    ApiService.globalCache[cacheKey] = response.data;
    return response.data;
  };

  getUserById = async (id: string) => {
    const response = await axiosClient.get(`/user/${id}`);
    return response.data;
  };

  deleteUser = async (id: string) => {
    const response = await axiosClient.delete(`/user/${id}`);
    this.clearCache("users");
    return response.data;
  };

  // ===== GRUPOS =====

  clearGroupsCache = () => {
    this.clearCache("groups");
  };
  createGroup = async (groupData: FormData) => {
    const response = await axiosClient.post("/groups", groupData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    this.clearCache("groups");
    Object.keys(ApiService.getGlobalCache()).forEach((key) => {
      if (key.startsWith("groups_user_") || key.startsWith("group_info_")) {
        this.clearCache(key);
      }
    });
    return response.data;
  };
  getAllGroups = async (page = 1, perPage = 15, search = "") => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });

    if (search) {
      queryParams.append("search", search);
    }

    const response = await axiosClient.get(`/groups?${queryParams.toString()}`);

    return response.data;
  };

  getGroupsByUserId = async (userId: string) => {
    const cacheKey = `groups_user_${userId}`;
    if (ApiService.globalCache[cacheKey])
      return ApiService.globalCache[cacheKey];

    const response = await axiosClient.get(`/groups/user/${userId}`);
    ApiService.globalCache[cacheKey] = response.data;
    ApiService.globalCache.groups = response.data;
    return response.data;
  };

  getGroupById = async (groupId: string) => {
    const cacheKey = `group_${groupId}`;
    if (ApiService.globalCache[cacheKey])
      return ApiService.globalCache[cacheKey];

    const response = await axiosClient.get(`/groups/${groupId}`);
    ApiService.globalCache[cacheKey] = response.data;
    return response.data;
  };
  getGroupMembers = async (groupId: string, forceRefresh = false) => {
    const cacheKey = `group_members_${groupId}`;
    if (!forceRefresh && ApiService.globalCache[cacheKey])
      return ApiService.globalCache[cacheKey];

    const response = await axiosClient.get(`/groups/${groupId}/members`);
    ApiService.globalCache[cacheKey] = response.data;
    return response.data;
  };

  checkUserMembership = async (groupId: string) => {
    const response = await axiosClient.get(
      `/groups/${groupId}/check-membership`
    );
    return response.data;
  };
  updateUserPermission = async (
    groupId: string,
    userId: string,
    permission: string
  ) => {
    const response = await axiosClient.put(
      `/groups/${groupId}/members/${userId}/permission`,
      { permission }
    );

    this.clearCache(`group_members_${groupId}`);
    this.clearCache(`group_info_${groupId}`);
    return response.data;
  };

  addUserToGroup = async (groupId: string, userData: AddUserToGroupData) => {
    const { userId, permission = "view" } = userData;
    const response = await axiosClient.post(`/groups/${groupId}/members`, {
      userId,
      permission,
    });

    this.clearCache(`group_members_${groupId}`);
    this.clearCache(`group_info_${groupId}`);
    Object.keys(ApiService.globalCache).forEach((key) => {
      if (key.startsWith("groups_user_")) {
        this.clearCache(key);
      }
    });
    return response.data;
  };
  joinGroup = async (groupId: string, permission?: string) => {
    const response = await axiosClient.post(`/groups/${groupId}/join`, {
      permission,
    });
    this.clearCache("groups");
    this.clearCache(`group_members_${groupId}`);
    this.clearCache(`group_info_${groupId}`);
    Object.keys(ApiService.globalCache).forEach((key) => {
      if (key.startsWith("groups_user_")) {
        this.clearCache(key);
      }
    });
    return response.data;
  };
  updateGroup = async (groupId: string, groupData: FormData) => {
    const response = await axiosClient.put(`/groups/${groupId}`, groupData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    this.clearCache("groups");
    this.clearCache(`group_${groupId}`);
    this.clearCache(`group_info_${groupId}`);
    Object.keys(ApiService.globalCache).forEach((key) => {
      if (key.startsWith("groups_user_")) {
        this.clearCache(key);
      }
    });
    return response.data;
  };
  leaveGroup = async (groupId: string) => {
    const response = await axiosClient.delete(`/groups/${groupId}/leave`);
    this.clearCache("groups");
    this.clearCache(`group_members_${groupId}`);
    this.clearCache(`group_info_${groupId}`);
    Object.keys(ApiService.globalCache).forEach((key) => {
      if (key.startsWith("groups_user_")) {
        this.clearCache(key);
      }
    });
    return response.data;
  };
  removeUserFromGroup = async (groupId: string, userId: string) => {
    const response = await axiosClient.delete(`/groups/${groupId}/members/`, {
      data: { userId },
    });

    this.clearCache(`group_members_${groupId}`);
    this.clearCache(`group_info_${groupId}`);
    Object.keys(ApiService.globalCache).forEach((key) => {
      if (key.startsWith("groups_user_")) {
        this.clearCache(key);
      }
    });
    return response.data;
  };
  deleteGroup = async (groupId: string) => {
    try {
      if (!groupId || groupId.trim() === "") {
        throw new Error("GroupId é obrigatório");
      }

      const url = `/groups/${encodeURIComponent(groupId)}`;

      const response = await axiosClient.delete(url);

      this.clearCache("groups");
      this.clearCache(`group_${groupId}`);
      this.clearCache(`group_info_${groupId}`);
      this.clearCache(`group_members_${groupId}`);
      Object.keys(ApiService.globalCache).forEach((key) => {
        if (key.includes(`_${groupId}`) || key.startsWith("groups_user_")) {
          this.clearCache(key);
        }
      });
      return response.data;
    } catch (error) {
      console.error("API: Erro ao fazer DELETE do grupo:", error);

      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: {
            status?: number;
            data?: unknown;
            headers?: unknown;
            config?: unknown;
          };
        };
        console.error("API: Status do erro:", axiosError.response?.status);
        console.error("API: Dados do erro:", axiosError.response?.data);
        console.error(
          "API: Config da requisição:",
          axiosError.response?.config
        );

        if (axiosError.response?.status === 400) {
          console.error("API: Erro 400 - Possíveis causas:");
          console.error(
            "- Grupo pode ter dependências (músicas, setlists, membros)"
          );
          console.error("- ID do grupo pode estar inválido");
          console.error("- Validação de negócio falhando no backend");
        } else if (axiosError.response?.status === 403) {
          console.error(
            "API: Erro 403 - Usuário não tem permissão para excluir este grupo"
          );
        } else if (axiosError.response?.status === 404) {
          console.error("API: Erro 404 - Grupo não encontrado");
        }
      }

      throw error;
    }
  };

  getInfoGroup = async (groupId: string) => {
    const cacheKey = `group_info_${groupId}`;
    if (ApiService.globalCache[cacheKey])
      return ApiService.globalCache[cacheKey];

    const response = await axiosClient.get(`/groups/${groupId}/info`);
    ApiService.globalCache[cacheKey] = response.data;
    return response.data;
  };

  // ===== SETLISTS =====

  clearSetlistsCache = () => {
    this.clearCache("setlists");

    Object.keys(ApiService.globalCache).forEach((key) => {
      if (key.startsWith("setlist_")) {
        this.clearCache(key);
      }
    });
  };
  createSetList = async (setlistData: FormData) => {
    const response = await axiosClient.post("/setlists", setlistData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    this.clearSetlistsCache();
    const groupId = response.data?.groupId;
    if (groupId) {
      this.clearCache(`setlists_group_${groupId}`);
      this.clearCache(`group_info_${groupId}`);
    }
    Object.keys(ApiService.globalCache).forEach((key) => {
      if (key.startsWith("setlists_group_")) {
        this.clearCache(key);
      }
    });
    return response.data;
  };

  getAllSetLists = async () => {
    if (ApiService.globalCache.setlists) return ApiService.globalCache.setlists;

    const response = await axiosClient.get("/setlists");
    ApiService.globalCache.setlists = response.data;
    return response.data;
  };

  getSetListById = async (id: string) => {
    const cacheKey = `setlist_${id}`;
    if (ApiService.globalCache[cacheKey])
      return ApiService.globalCache[cacheKey];

    const response = await axiosClient.get(`/setlists/${id}`);
    ApiService.globalCache[cacheKey] = response.data;
    return response.data;
  };

  getSetListsByGroup = async (groupId: string) => {
    const cacheKey = `setlists_group_${groupId}`;
    if (ApiService.globalCache[cacheKey])
      return ApiService.globalCache[cacheKey];

    const response = await axiosClient.get(`/groups/${groupId}/setlists`);
    ApiService.globalCache[cacheKey] = response.data;
    return response.data;
  };
  updateSetList = async (id: string, setlistData: FormData) => {
    const response = await axiosClient.put(`/setlists/${id}`, setlistData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    this.clearSetlistsCache();
    Object.keys(ApiService.globalCache).forEach((key) => {
      if (key.startsWith("setlists_group_") || key.startsWith("group_info_")) {
        this.clearCache(key);
      }
    });
    return response.data;
  };
  deleteSetList = async (id: string) => {
    const response = await axiosClient.delete(`/setlists/${id}`);
    this.clearSetlistsCache();
    Object.keys(ApiService.globalCache).forEach((key) => {
      if (key.startsWith("setlists_group_") || key.startsWith("group_info_")) {
        this.clearCache(key);
      }
    });
    return response.data;
  };

  // ===== SETLIST MÚSICAS =====
  addMusicToSetList = async (
    setlistId: string,
    musicId: string,
    order: number = 0
  ) => {
    const response = await axiosClient.post(
      `/setlists/${setlistId}/musics/${musicId}`,
      { order }
    );
    this.clearCache(`setlist_${setlistId}`);
    Object.keys(ApiService.globalCache).forEach((key) => {
      if (key.startsWith("setlists_group_") || key.startsWith("group_info_")) {
        this.clearCache(key);
      }
    });
    return response.data;
  };
  removeMusicFromSetList = async (setlistId: string, musicId: string) => {
    const response = await axiosClient.delete(
      `/setlists/${setlistId}/musics/${musicId}`
    );
    this.clearCache(`setlist_${setlistId}`);
    Object.keys(ApiService.globalCache).forEach((key) => {
      if (key.startsWith("setlists_group_") || key.startsWith("group_info_")) {
        this.clearCache(key);
      }
    });
    return response.data;
  };

  reorderSetListMusic = async (
    setlistId: string,
    musicId: string,
    orderData: number
  ) => {
    const response = await axiosClient.put(
      `/setlists/${setlistId}/musics/${musicId}/order`,
      orderData
    );
    this.clearCache(`setlist_${setlistId}`);
    return response.data;
  };

  // ===== MÚSICAS =====

  clearMusicsCache = () => {
    this.clearCache("musics");

    Object.keys(ApiService.globalCache).forEach((key) => {
      if (key.startsWith("music_") || key.startsWith("musics_")) {
        this.clearCache(key);
      }
    });
  };
  createMusic = async (groupId: string, musicData: FormData) => {
    const response = await axiosClient.post(
      `/groups/${groupId}/musics`,
      musicData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    this.clearMusicsCache();
    this.clearCache(`musics_group_${groupId}`);
    this.clearCache(`group_info_${groupId}`);
    return response.data;
  };

  getAllMusicsByGroup = async (groupId: string) => {
    const cacheKey = `musics_group_${groupId}`;
    if (ApiService.globalCache[cacheKey])
      return ApiService.globalCache[cacheKey];

    const response = await axiosClient.get(`/groups/${groupId}/musics`);
    ApiService.globalCache[cacheKey] = response.data;
    return response.data;
  };

  getMusicsByGroupPaginated = async (
    groupId: string,
    page = 1,
    perPage = 15,
    search = ""
  ) => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });

    if (search) {
      queryParams.append("search", search);
    }

    const response = await axiosClient.get(
      `/groups/${groupId}/musics?${queryParams.toString()}`
    );
    return response.data;
  };

  getMusicById = async (id: string) => {
    const cacheKey = `music_${id}`;
    if (ApiService.globalCache[cacheKey])
      return ApiService.globalCache[cacheKey];

    const response = await axiosClient.get(`/musics/${id}`);
    ApiService.globalCache[cacheKey] = response.data;
    return response.data;
  };
  updateMusic = async (id: string, musicData: FormData) => {
    const response = await axiosClient.put(`/musics/${id}`, musicData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    this.clearMusicsCache();
    Object.keys(ApiService.globalCache).forEach((key) => {
      if (key.startsWith("musics_group_") || key.startsWith("group_info_")) {
        this.clearCache(key);
      }
    });
    return response.data;
  };
  deleteMusic = async (id: string) => {
    const response = await axiosClient.delete(`/musics/${id}`);
    this.clearMusicsCache();
    Object.keys(ApiService.globalCache).forEach((key) => {
      if (key.startsWith("musics_group_") || key.startsWith("group_info_")) {
        this.clearCache(key);
      }
    });
    return response.data;
  };

  // ===== UTILITÁRIOS DE MÚSICA =====

  verifyMusicExists = async ({ groupId, title, author }: MusicExistsProps) => {
    const response = await axiosClient.get("/musics/exists", {
      params: {
        groupId,
        title: encodeURIComponent(title),
        author: encodeURIComponent(author),
      },
    });
    return response.data;
  };

  searchLyrics = async (query: string) => {
    const response = await axiosClient.get(
      `/search-lyrics?query=${encodeURIComponent(query)}`
    );
    return response.data;
  };

  extractLyrics = async (url: string) => {
    const response = await axiosClient.post("/extract-lyrics", { url });
    return response.data;
  };

  getYoutubeThumbnail = async (url: string) => {
    const response = await axiosClient.get(
      `/youtube-thumbnail?url=${encodeURIComponent(url)}`
    );
    return response.data;
  };
}

export const useApi = () => {
  const [refreshToken, setRefreshToken] = useState(0);

  const invalidateCache = useCallback(() => {
    setRefreshToken((prev) => prev + 1);
  }, []);

  const api = useMemo(() => {
    return new ApiService();
  }, []);

  useEffect(() => {
    if (refreshToken > 0) {
      api.clearAllCache();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshToken]);

  const clearSpecificCache = useCallback(
    (key: string) => {
      api.clearCache(key);
    },
    [api]
  );
  const clearAllGroupCaches = useCallback(() => {
    api.clearGroupsCache();
    Object.keys(ApiService.getGlobalCache()).forEach((key) => {
      if (
        key.startsWith("groups_user_") ||
        key.startsWith("group_info_") ||
        key.startsWith("group_members_")
      ) {
        api.clearCache(key);
      }
    });
  }, [api]);
  return {
    ...api,
    invalidateCache,
    clearSpecificCache,
    clearAllGroupCaches,
    sessionLogin: api.sessionLogin,
    createExtendedToken: api.createExtendedToken,
    logout: api.logout,
    logoutAll: api.logoutAll,
    checkAndMigrateTokens: api.checkAndMigrateTokens,
  };
};

export default useApi;
