import axiosClient from "../config/axios-client";
import { LoginCredentials, RegisterCredentials } from "../types/user";
import { useMemo, useState, useCallback, useEffect } from "react";

// Interface para o cache dinâmico
interface CacheType {
  users: unknown | null;
  groups: unknown | null;
  setlists: unknown | null;
  musics: unknown | null;
  loading: boolean;
  [key: string]: unknown | null; // Permitir índices dinâmicos
}

interface AddUserToGroupData {
  userId: string;
  permission: string;
}

class ApiService {
  // Cache que pode ser acessado por toda a aplicação
  private static globalCache: CacheType = {
    users: null,
    groups: null,
    setlists: null,
    musics: null,
    loading: false,
  };

  // Método para limpar todo o cache
  clearAllCache() {
    Object.keys(ApiService.globalCache).forEach((key) => {
      ApiService.globalCache[key] = null;
    });
  }

  // Método para limpar um cache específico
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

  // ===== USUÁRIOS =====
  updateUser = async (userData: FormData) => {
    const response = await axiosClient.put("/user/profile", userData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    // Invalidar o cache de usuários após atualização
    this.clearCache("users");
    return response.data;
  };

  getAllUsers = async () => {
    if (ApiService.globalCache.users) return ApiService.globalCache.users;
    const response = await axiosClient.get("/users");
    ApiService.globalCache.users = response.data;
    return response.data;
  };

  getUserById = async (id: string) => {
    const response = await axiosClient.get(`/user/${id}`);
    return response.data;
  };

  deleteUser = async (id: string) => {
    const response = await axiosClient.delete(`/user/${id}`);
    // Invalidar o cache de usuários após exclusão
    this.clearCache("users");
    return response.data;
  };

  // ===== GRUPOS =====

  // Método para limpar o cache de grupos
  clearGroupsCache = () => {
    this.clearCache("groups");
  };

  createGroup = async (groupData: FormData) => {
    const response = await axiosClient.post("/groups", groupData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    // Invalidar o cache de grupos após criar um novo
    this.clearCache("groups");
    return response.data;
  };

  getAllGroups = async () => {
    if (ApiService.globalCache.groups) return ApiService.globalCache.groups;
    const response = await axiosClient.get("/groups");
    ApiService.globalCache.groups = response.data;
    return response.data;
  };

  getGroupsByUserId = async (userId: string) => {
    const cacheKey = `groups_user_${userId}`;
    if (ApiService.globalCache[cacheKey])
      return ApiService.globalCache[cacheKey];

    const response = await axiosClient.get(`/groups/user/${userId}`);
    ApiService.globalCache[cacheKey] = response.data;
    ApiService.globalCache.groups = response.data; // Manter compatibilidade com cache existente
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

  getGroupMembers = async (groupId: string) => {
    const cacheKey = `group_members_${groupId}`;
    if (ApiService.globalCache[cacheKey])
      return ApiService.globalCache[cacheKey];

    const response = await axiosClient.get(`/groups/${groupId}/members`);
    ApiService.globalCache[cacheKey] = response.data;
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

    // Invalidar cache de membros do grupo
    this.clearCache(`group_members_${groupId}`);
    return response.data;
  };

  addUserToGroup = async (groupId: string, userData: AddUserToGroupData) => {
    const response = await axiosClient.post(
      `/groups/${groupId}/members`,
      userData
    );

    // Invalidar cache de membros do grupo
    this.clearCache(`group_members_${groupId}`);
    return response.data;
  };

  joinGroupByInvite = async (groupId: string, inviteCode: string) => {
    const response = await axiosClient.post(`/groups/${groupId}/join`, {
      inviteCode,
    });
    // Invalidar cache de grupos após entrar em um novo
    this.clearCache("groups");
    return response.data;
  };

  updateGroup = async (groupId: string, groupData: FormData) => {
    const response = await axiosClient.put(`/groups/${groupId}`, groupData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    // Invalidar cache de grupos e do grupo específico
    this.clearCache("groups");
    this.clearCache(`group_${groupId}`);
    return response.data;
  };

  leaveGroup = async (groupId: string) => {
    const response = await axiosClient.delete(`/groups/${groupId}/leave`);
    // Invalidar cache de grupos após sair
    this.clearCache("groups");
    return response.data;
  };

  removeUserFromGroup = async (groupId: string, userId: string) => {
    const response = await axiosClient.delete(
      `/groups/${groupId}/members/${userId}`
    );

    // Invalidar cache de membros do grupo
    this.clearCache(`group_members_${groupId}`);
    return response.data;
  };

  deleteGroup = async (groupId: string) => {
    const response = await axiosClient.delete(`/groups/${groupId}`);
    // Invalidar cache de grupos após exclusão
    this.clearCache("groups");
    this.clearCache(`group_${groupId}`);
    return response.data;
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

  // Método para limpar o cache de setlists
  clearSetlistsCache = () => {
    this.clearCache("setlists");

    // Limpar também caches específicos de setlists
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
    // Invalidar o cache de setlists após criar uma nova
    this.clearSetlistsCache();
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
    // Invalidar o cache de setlists após atualização
    this.clearSetlistsCache();
    return response.data;
  };

  deleteSetList = async (id: string) => {
    const response = await axiosClient.delete(`/setlists/${id}`);
    // Invalidar o cache de setlists após exclusão
    this.clearSetlistsCache();
    return response.data;
  };

  // ===== SETLIST MÚSICAS =====
  addMusicToSetList = async (setlistId: string, musicId: string) => {
    const response = await axiosClient.post(
      `/setlists/${setlistId}/musics/${musicId}`
    );
    // Invalidar cache de setlist específica
    this.clearCache(`setlist_${setlistId}`);
    return response.data;
  };

  removeMusicFromSetList = async (setlistId: string, musicId: string) => {
    const response = await axiosClient.delete(
      `/setlists/${setlistId}/musics/${musicId}`
    );
    // Invalidar cache de setlist específica
    this.clearCache(`setlist_${setlistId}`);
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
    // Invalidar cache de setlist específica
    this.clearCache(`setlist_${setlistId}`);
    return response.data;
  };

  // ===== MÚSICAS =====

  // Método para limpar o cache de músicas
  clearMusicsCache = () => {
    this.clearCache("musics");

    // Limpar também caches específicos de músicas
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
    // Invalidar o cache de músicas após criar uma nova
    this.clearMusicsCache();
    // Invalidar o cache de músicas deste grupo específico
    this.clearCache(`musics_group_${groupId}`);
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
    // Para dados paginados ou com busca, não usamos cache para garantir dados atualizados
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
    // Invalidar o cache de músicas após atualização
    this.clearMusicsCache();
    return response.data;
  };

  deleteMusic = async (id: string) => {
    const response = await axiosClient.delete(`/musics/${id}`);
    // Invalidar o cache de músicas após exclusão
    this.clearMusicsCache();
    return response.data;
  };

  // ===== UTILITÁRIOS DE MÚSICA =====
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
  // Usar useState para gerenciar um estado de refresh de cache
  const [refreshToken, setRefreshToken] = useState(0);

  // Função para invalidar todo o cache e forçar atualização
  const invalidateCache = useCallback(() => {
    setRefreshToken((prev) => prev + 1);
  }, []);

  // Criar uma instância memoizada da classe ApiService que persiste entre renderizações
  const api = useMemo(() => {
    return new ApiService();
  }, []);

  // Efetua a limpeza do cache quando o refreshToken mudar
  useEffect(() => {
    if (refreshToken > 0) {
      api.clearAllCache();
    }
  }, [refreshToken, api]);

  // Retorna a API com todas as funções + a função de invalidação de cache
  return {
    ...api,
    invalidateCache,
  };
};

export default useApi;
