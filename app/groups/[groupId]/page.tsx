"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Music,
  Plus,
  List,
  Users,
  ChevronRight,
  Search,
  MoreVerticalIcon,
  Edit,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/components/ui/avatar";
import Image from "next/image";
import { useApi } from "@/app/hooks/use-api";
import { Group } from "@/app/types/group";
import { Music as MusicType } from "@/app/types/music";
import { Setlist } from "@/app/types/setlist";
import { User } from "@/app/types/user";
import { LoadingIcon } from "@/app/components/loading-icon";
import { useAuth } from "@/app/context/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { toast } from "sonner";
import MusicList from "@/app/components/musics/music-list";
import SetListLits from "@/app/components/setlist/setlist-list";
import SetListList from "@/app/components/setlist/setlist-list";

interface MemberData {
  id: string;
  permission: string;
  user: User;
}

export default function GroupPage() {
  const params = useParams();
  const api = useApi();
  const groupId = params.groupId as string;

  const [activeTab, setActiveTab] = useState("songs");
  const [isLoading, setIsLoading] = useState(true);
  const [group, setGroup] = useState<Group | null>(null);
  const [musics, setMusics] = useState<MusicType[]>([]);
  const [setlists, setSetlists] = useState<Setlist[]>([]);
  const [members, setMembers] = useState<MemberData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingPermission, setUpdatingPermission] = useState<string | null>(
    null
  );
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [permission, setPermission] = useState("view");

  useEffect(() => {
    const fetchGroup = async () => {
      setIsLoading(true);
      try {
        const response = await api.getGroupById(groupId);
        if (!response) {
          toast.error("Grupo não encontrado");
          return;
        }
        setGroup(response);

        const membersResponse = await api.getGroupMembers(groupId);
        setMembers(membersResponse);

        const setlistsResponse = await api.getSetListsByGroup(groupId);
        setSetlists(setlistsResponse);

        const isUserAdmin = membersResponse.some(
          (member: MemberData) =>
            member.user.id === user?.id && member.permission === "admin"
        );
        setIsAdmin(isUserAdmin);

        const permissionFound = membersResponse.find(
          (member: MemberData) => member.user.id === user?.id
        );
        if (permissionFound) {
          setPermission(permissionFound.permission);
        }
      } catch (error) {
        console.error("Erro ao carregar grupo:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGroup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId, user?.id]);

  const loadMusics = useCallback(
    async (page: number, perPage: number, search: string) => {
      try {
        const response = await api.getMusicsByGroupPaginated(
          groupId,
          page,
          perPage,
          search
        );
        setHasMore(response.pagination.hasNext);
        setMusics((prevMusics) => {
          const newMusics = response.data.filter(
            (newMusic: MusicType) =>
              !prevMusics.some((music) => music.id === newMusic.id)
          );
          return [...prevMusics, ...newMusics];
        });
      } catch (error) {
        console.error("Erro ao carregar músicas:", error);
        toast.error("Erro ao carregar músicas");
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [groupId]
  );

  useEffect(() => {
    setMusics([]);
    console.log("Carregando primeira página com busca:", searchQuery);
    loadMusics(1, 5, searchQuery);
  }, [loadMusics, searchQuery]);

  const loadMore = () => {
    if (hasMore) {
      const nextPage = page + 1;
      console.log("Carregando mais músicas para a página:", nextPage);
      loadMusics(nextPage, 5, searchQuery);
      setPage(nextPage);
    }
  };

  const updateSearchQuery = (query: string) => {
    setSearchQuery(query);
    setPage(1);
    setHasMore(true);
    setMusics([]);
    loadMusics(1, 5, query);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setPage(1);
    setHasMore(true);
    setMusics([]);
    loadMusics(1, 5, "");
  };

  // permissão
  const handlePermissionChange = async (
    userId: string,
    newPermission: string
  ) => {
    try {
      setUpdatingPermission(userId);
      await api.updateUserPermission(groupId, userId, newPermission);

      setMembers((prevMembers) =>
        prevMembers.map((member) =>
          member.user.id === userId
            ? { ...member, permission: newPermission }
            : member
        )
      );
    } catch (error) {
      console.error("Erro ao atualizar permissão:", error);
    } finally {
      setUpdatingPermission(null);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await api.removeUserFromGroup(groupId, userId);
      setMembers((prevMembers) =>
        prevMembers.filter((member) => member.user.id !== userId)
      );
      toast.success("Membro removido com sucesso!");
    } catch (error) {
      console.error("Erro ao remover membro:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center min-h-[60vh]">
        <LoadingIcon size={45} />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold">Grupo não encontrado</h1>
        <Button variant="link" asChild className="p-0 mt-2">
          <Link href="/">Voltar para a lista de grupos</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-5">
      <div className="flex items-center justify-between mb-8 w-full">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full overflow-hidden bg-orange-100 flex items-center justify-center">
            <Image
              src={group.imageUrl || "/placeholder-groups.png"}
              alt={group.name}
              width={64}
              height={64}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{group.name}</h1>
            <p className="truncate w-full text-zinc-600">{group.description}</p>
          </div>
        </div>
        {user && isAdmin ? (
          <div className="flex items-center gap-4">
            <Button asChild variant="outline">
              <Link href={`/groups/${groupId}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Editar Grupo
              </Link>
            </Button>
          </div>
        ) : null}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="songs" className="flex items-center gap-2">
            <Music className="h-4 w-4" />
            Músicas
          </TabsTrigger>
          <TabsTrigger value="setlists" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Setlists
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Membros
          </TabsTrigger>
        </TabsList>{" "}
        <TabsContent value="songs">
          {" "}
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
        </TabsContent>
        <TabsContent value="setlists">
          <SetListList groupId={groupId} setlists={setlists} />
        </TabsContent>
        <TabsContent value="members">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Membros</h2>
            <Button asChild className="bg-orange-500 hover:bg-orange-600">
              <Link href={`/groups/${groupId}/invite`}>
                <Plus className="mr-2 h-4 w-4" />
                Convidar Membro
              </Link>
            </Button>
          </div>
          {members.length === 0 ? (
            <Card className="bg-muted/40">
              <CardContent className="py-8 text-center">
                <h3 className="text-lg font-medium mb-2">
                  Nenhum membro encontrado
                </h3>
                <p className="text-muted-foreground mb-4">
                  Convide membros para participar do seu grupo de louvor.
                </p>
                <Button asChild className="bg-orange-500 hover:bg-orange-600">
                  <Link href={`/groups/${groupId}/invite`}>
                    <Plus className="mr-2 h-4 w-4" />
                    Convidar Membros
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {members.map((member) => (
                <Card
                  key={member.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="py-4 flex items-center justify-between">
                    {" "}
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage
                          src={member.user.imageUrl || "/placeholder-user.png"}
                          alt={member.user.name}
                        />
                        <AvatarFallback>
                          {member.user.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium text-sm">
                          {member.user.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {member.user.email}
                        </p>
                      </div>
                    </div>
                    {user &&
                    members.find((m) => m.user.id === user.id)?.permission ===
                      "admin" &&
                    member.user.id !== user.id ? (
                      <>
                        {" "}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVerticalIcon className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white">
                            <DropdownMenuLabel>Mais Opções</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="cursor-pointer text-red-500 text-xs flex items-center hover:bg-red-100"
                              onClick={() => handleRemoveMember(member.user.id)}
                            >
                              <Users className="mr-2 h-4 w-4 text-red-500" />
                              <span>Remover Membro</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer text-xs flex items-center">
                              <Select
                                onValueChange={(value) =>
                                  handlePermissionChange(member.user.id, value)
                                }
                              >
                                <SelectTrigger className="w-[180px]">
                                  <SelectValue
                                    placeholder={member.permission}
                                  />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="view">
                                    Vizualizar
                                  </SelectItem>
                                  <SelectItem value="edit">Editar</SelectItem>
                                </SelectContent>
                              </Select>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                    ) : (
                      <div className="bg-orange-100 text-orange-800 px-2 py-1 rounded-md text-sm font-medium">
                        {member.permission}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
