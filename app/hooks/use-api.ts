import axiosClient from "../config/axios-client";
import { LoginCredentials, RegisterCredentials } from "../types/user";

// Cache para armazenar dados frequentemente acessados
const cache = {
  users: null,
  groups: null,
  setlists: null,
  musics: null,
  loading: false,
};

interface AddUserToGroupData {
  userId: string;
  permission: string;
}

class UseApi {
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
    return response.data;
  };

  getAllUsers = async () => {
    if (cache.users) return cache.users;
    const response = await axiosClient.get("/users");
    cache.users = response.data;
    return cache.users;
  };

  getUserById = async (id: string) => {
    const response = await axiosClient.get(`/user/${id}`);
    return response.data;
  };

  deleteUser = async (id: string) => {
    const response = await axiosClient.delete(`/user/${id}`);
    return response.data;
  };

  // ===== GRUPOS =====
  createGroup = async (groupData: FormData) => {
    const response = await axiosClient.post("/groups", groupData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  };

  getAllGroups = async () => {
    if (cache.groups) return cache.groups;
    const response = await axiosClient.get("/groups");
    cache.groups = response.data;
    return cache.groups;
  };

  getGroupsByUserId = async (userId: string) => {
    const response = await axiosClient.get(`/groups/user/${userId}`);
    return response.data;
  };

  getGroupById = async (groupId: string) => {
    const response = await axiosClient.get(`/groups/${groupId}`);
    return response.data;
  };

  getGroupMembers = async (groupId: string) => {
    const response = await axiosClient.get(`/groups/${groupId}/members`);
    return response.data;
  };

  addUserToGroup = async (groupId: string, userData: AddUserToGroupData) => {
    const response = await axiosClient.post(
      `/groups/${groupId}/members`,
      userData
    );
    return response.data;
  };

  joinGroupByInvite = async (groupId: string, inviteCode: string) => {
    const response = await axiosClient.post(`/groups/${groupId}/join`, {
      inviteCode,
    });
    return response.data;
  };

  updateGroup = async (groupId: string, groupData: FormData) => {
    const response = await axiosClient.put(`/groups/${groupId}`, groupData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  };

  leaveGroup = async (groupId: string) => {
    const response = await axiosClient.delete(`/groups/${groupId}/leave`);
    return response.data;
  };

  removeUserFromGroup = async (groupId: string, userId: string) => {
    const response = await axiosClient.delete(
      `/groups/${groupId}/members/${userId}`
    );
    return response.data;
  };

  deleteGroup = async (groupId: string) => {
    const response = await axiosClient.delete(`/groups/${groupId}`);
    return response.data;
  };

  // ===== SETLISTS =====
  createSetList = async (setlistData: FormData) => {
    const response = await axiosClient.post("/setlists", setlistData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  };

  getAllSetLists = async () => {
    if (cache.setlists) return cache.setlists;
    const response = await axiosClient.get("/setlists");
    cache.setlists = response.data;
    return cache.setlists;
  };

  getSetListById = async (id: string) => {
    const response = await axiosClient.get(`/setlists/${id}`);
    return response.data;
  };

  getSetListsByGroup = async (groupId: string) => {
    const response = await axiosClient.get(`/groups/${groupId}/setlists`);
    return response.data;
  };

  updateSetList = async (id: string, setlistData: FormData) => {
    const response = await axiosClient.put(`/setlists/${id}`, setlistData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  };

  deleteSetList = async (id: string) => {
    const response = await axiosClient.delete(`/setlists/${id}`);
    return response.data;
  };

  // ===== SETLIST MÚSICAS =====
  addMusicToSetList = async (setlistId: string, musicId: string) => {
    const response = await axiosClient.post(
      `/setlists/${setlistId}/musics/${musicId}`
    );
    return response.data;
  };

  removeMusicFromSetList = async (setlistId: string, musicId: string) => {
    const response = await axiosClient.delete(
      `/setlists/${setlistId}/musics/${musicId}`
    );
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
    return response.data;
  };

  // ===== MÚSICAS =====
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
    return response.data;
  };

  getAllMusicsByGroup = async (groupId: string) => {
    const response = await axiosClient.get(`/groups/${groupId}/musics`);
    return response.data;
  };

  getMusicById = async (id: string) => {
    const response = await axiosClient.get(`/musics/${id}`);
    return response.data;
  };

  updateMusic = async (id: string, musicData: FormData) => {
    const response = await axiosClient.put(`/musics/${id}`, musicData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  };

  deleteMusic = async (id: string) => {
    const response = await axiosClient.delete(`/musics/${id}`);
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
  const api = new UseApi();
  return api;
};

export default useApi;
