import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { useEffect, useState, useCallback } from "react";
import { useApi } from "@/app/hooks/use-api";
import { Group as TypeGroup } from "@/app/types/group";
import { LoadingIcon } from "./loading-icon";
import { toast } from "sonner";
import { useAuth } from "../context/auth-context";
import GroupItem from "./groupItem";

interface GroupInfoProps extends TypeGroup {
  stats: {
    musicsCount: number;
    setlistsCount: number;
    membersCount: number;
  };
}

export function GroupListing() {
  const [groups, setGroups] = useState<TypeGroup[] | []>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [groupsInfo, setGroupsInfo] = useState<{
    [key: string]: GroupInfoProps;
  }>({});
  const { user } = useAuth();
  const api = useApi();
  const fetchGroups = useCallback(async () => {
    try {
      setIsLoading(true);

      if (!user) {
        toast.error("Usuário não encontrado");
        return;
      }
      api.clearAllGroupCaches();

      const response = await api.getGroupsByUserId(user.id);
      const data = response
        ? (response as Array<TypeGroup | { groupId: string; group: TypeGroup }>)
        : [];

      const groupsData = data.map((item) => {
        if ("groupId" in item && "group" in item) {
          return item.group;
        }
        return item as TypeGroup;
      });

      setGroups(groupsData);

      if (groupsData.length > 0) {
        const groupStats = await Promise.all(
          groupsData.map(async (group) => {
            try {
              const stats = await api.getInfoGroup(group.id);

              const formattedStats = {
                musicsCount: stats.stats?.musicsCount || 0,
                setlistsCount: stats.stats?.setlistsCount || 0,
                membersCount: stats.stats?.membersCount || 0,
              };

              return {
                ...group,
                stats: formattedStats,
              };
            } catch (err) {
              toast.error(
                `Erro ao obter estatísticas do grupo ${group.id}: ${
                  (err as Error).message
                }`
              );
              return {
                ...group,
                stats: {
                  musicsCount: 0,
                  setlistsCount: 0,
                  membersCount: 0,
                },
              };
            }
          })
        );

        const groupsInfoMap = groupStats.reduce((map, group) => {
          map[group.id] = group;
          return map;
        }, {} as { [key: string]: GroupInfoProps });

        setGroupsInfo(groupsInfoMap);
      }
    } catch (error) {
      console.error("Erro ao carregar grupos:", error);
    } finally {
      setIsLoading(false);
    }
  }, [api, user]);

  useEffect(() => {
    api.clearGroupsCache();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (user) {
      fetchGroups();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        fetchGroups();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchGroups, user]);
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-orange-950/10">
        <div className="container mx-auto py-12 px-6 flex justify-center items-center min-h-[70vh]">
          <LoadingIcon />
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-orange-950/10">
      <div className="container mx-auto py-12 px-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12">
          <div className="mb-6 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 to-orange-600 dark:from-white dark:to-orange-400 bg-clip-text text-transparent mb-2">
              Seus Grupos
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Gerencie e colabore com suas equipes de louvor
            </p>
          </div>
          <Button
            asChild
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 w-fit"
          >
            <Link href="/create-group" className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Criar Novo Grupo
            </Link>
          </Button>
        </div>

        {groups.length === 0 ? (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="h-20 w-20 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Plus className="h-10 w-10 text-orange-500" />
              </div>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-3">
                Nenhum grupo encontrado
              </h2>
              <p className="text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                Você ainda não participa de nenhum grupo. Comece criando seu
                primeiro grupo de louvor ou peça para ser adicionado a um grupo
                existente.
              </p>
              <Button
                asChild
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Link href="/create-group" className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Criar Primeiro Grupo
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <GroupItem key={group.id} group={group} groupsInfo={groupsInfo} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
