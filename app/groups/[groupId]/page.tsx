"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useApi } from "@/app/hooks/use-api";
import { Music as MusicType } from "@/app/types/music";
import { useAuth } from "@/app/context/auth-context";
import { toast } from "sonner";
import MusicList from "@/app/components/musics/music-list";

interface MemberData {
  id: string;
  permission: string;
  user: {
    id: string;
    name: string;
    email: string;
    imageUrl?: string;
  };
}

export default function GroupSongsPage() {
  const params = useParams();
  const api = useApi();
  const groupId = params.groupId as string;
  const { user } = useAuth();

  const [musics, setMusics] = useState<MusicType[]>([]);
  const [members, setMembers] = useState<MemberData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [permission, setPermission] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Memoriza as funções do api para evitar loop infinito
  const getGroupMembers = api.getGroupMembers;
  const getMusicsByGroupPaginated = api.getMusicsByGroupPaginated;

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const membersResponse = await getGroupMembers(groupId);
        setMembers(membersResponse);

        const permissionFound = membersResponse.find(
          (member: MemberData) => member.user.id === user?.id
        );
        if (permissionFound) {
          setPermission(permissionFound.permission);
        }
      } catch (error) {
        console.error("Erro ao carregar membros:", error);
      }
    };

    if (user && groupId) {
      fetchMembers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, groupId]);

  const loadMusics = useCallback(
    async (page: number, perPage: number, search: string) => {
      try {
        setIsLoading(true);
        const response = await getMusicsByGroupPaginated(
          groupId,
          page,
          perPage,
          search
        );
        setHasMore(response.pagination.hasNext);
        setMusics((prevMusics) => {
          if (page === 1) {
            return response.data;
          } else {
            const newMusics = response.data.filter(
              (newMusic: MusicType) =>
                !prevMusics.some((music) => music.id === newMusic.id)
            );
            return [...prevMusics, ...newMusics];
          }
        });
      } catch (error) {
        console.error("Erro ao carregar músicas:", error);
        toast.error("Erro ao carregar músicas");
      } finally {
        setIsLoading(false);
      }
    },
    [groupId, getMusicsByGroupPaginated]
  );

  useEffect(() => {
    const loadInitialMusics = async () => {
      if (!groupId) return;

      try {
        setIsLoading(true);
        setMusics([]);
        setPage(1);
        setHasMore(true);

        const response = await getMusicsByGroupPaginated(
          groupId,
          1,
          10,
          searchQuery
        );
        setHasMore(response.pagination.hasNext);
        setMusics(response.data);
      } catch (error) {
        console.error("Erro ao carregar músicas:", error);
        toast.error("Erro ao carregar músicas");
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialMusics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId, searchQuery]);

  const loadMore = () => {
    if (hasMore) {
      const nextPage = page + 1;
      loadMusics(nextPage, 10, searchQuery);
      setPage(nextPage);
    }
  };
  const updateSearchQuery = (query: string) => {
    setSearchQuery(query);
    setPage(1);
    setHasMore(true);
    // Não chama loadMusics aqui pois o useEffect vai fazer isso
  };

  const clearSearch = () => {
    setSearchQuery("");
    setPage(1);
    setHasMore(true);
    // Não chama loadMusics aqui pois o useEffect vai fazer isso
  };

  return (
    <MusicList
      clearSearch={clearSearch}
      groupId={groupId}
      musics={musics}
      isLoading={isLoading}
      searchQuery={searchQuery}
      setSearchQuery={updateSearchQuery}
      permission={permission}
      hasMore={hasMore}
      loadMore={loadMore}
    />
  );
}
