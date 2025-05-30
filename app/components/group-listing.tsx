import Link from "next/link";
import { Music, Plus, Users, Calendar } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { useApi } from "@/app/hooks/use-api";
import { Group as TypeGroup } from "@/app/types/group";
import { LoadingIcon } from "./loading-icon";
import { toast } from "sonner";
import { useAuth } from "../context/auth-context";

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
      <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[60vh]">
        <LoadingIcon />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Seus grupos</h1>
        </div>
        <Button asChild className="bg-orange-500 hover:bg-orange-600">
          <Link href="/create-group" className="text-xs">
            <Plus className="h-4 w-4" />
            Criar Novo Grupo
          </Link>
        </Button>
      </div>

      {groups.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-base font-semibold mb-2">
            Nenhum grupo encontrado
          </h2>
          <p className="text-muted-foreground mb-6 text-sm">
            Você ainda não participa de nenhum grupo. Pesquise por grupos
            existentes ou crie um novo grupo de louvor.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <Link
              key={group.id}
              href={`/groups/${group.id}`}
              className="block group"
            >
              <Card className="h-full transition-all duration-200 hover:shadow-md hover:border-orange-200 dark:hover:border-orange-900 group-hover:border-orange-200">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 rounded-full overflow-hidden bg-orange-100 flex items-center justify-center border-2 border-orange-200">
                      <Image
                        src={group.imageUrl || "/placeholder-groups.png"}
                        alt={group.name}
                        fill
                        sizes="80px"
                        priority
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <CardTitle className="group-hover:text-orange-500 transition-colors">
                        {group.name}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        Criado em{" "}
                        {new Date(group.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <div className="flex flex-col items-center p-2 bg-muted rounded-md">
                      {" "}
                      <Music className="h-4 w-4 text-orange-500 mb-1" />
                      <span className="text-sm font-medium">
                        {groupsInfo[group.id]?.stats.musicsCount || 0}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Músicas
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-muted rounded-md">
                      <Calendar className="h-4 w-4 text-orange-500 mb-1" />
                      <span className="text-sm font-medium">
                        {groupsInfo[group.id]?.stats.setlistsCount || 0}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Setlists
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-muted rounded-md">
                      <Users className="h-4 w-4 text-orange-500 mb-1" />
                      <span className="text-sm font-medium">
                        {groupsInfo[group.id]?.stats.membersCount || 0}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Membros
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <Button
                    variant="ghost"
                    className="w-full text-orange-500 group-hover:bg-orange-50 dark:group-hover:bg-orange-900"
                  >
                    Ver Grupo
                  </Button>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
