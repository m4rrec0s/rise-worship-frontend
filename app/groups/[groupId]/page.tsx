"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Music,
  Plus,
  List,
  Users,
  MoreVerticalIcon,
  Edit,
  Eye,
  Crown,
  DoorOpen,
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
import { Card, CardContent } from "@/app/components/ui/card";
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
import SetListList from "@/app/components/setlist/setlist-list";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/app/components/ui/alert-dialog";

interface MemberData {
  id: string;
  permission: string;
  user: User;
}

export default function GroupPage() {
  const params = useParams();
  const api = useApi();
  const groupId = params.groupId as string;
  const router = useRouter();

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
  const [permission, setPermission] = useState("");
  const reloadGroupData = useCallback(async () => {
    api.clearSpecificCache(`group_${groupId}`);
    api.clearSpecificCache(`group_members_${groupId}`);
    api.clearSpecificCache(`setlists_group_${groupId}`);
    api.clearSpecificCache(`group_info_${groupId}`);

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
        const userPermission = permissionFound.permission;
        setPermission(userPermission);
      }
    } catch (error) {
      console.error("Erro ao carregar grupo:", error);
    } finally {
      setIsLoading(false);
    }
  }, [api, groupId, user?.id]);

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
          const userPermission = permissionFound.permission;
          setPermission(userPermission);
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

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        reloadGroupData();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [reloadGroupData]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        reloadGroupData();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [reloadGroupData]);

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
    loadMusics(1, 5, searchQuery);
  }, [loadMusics, searchQuery]);

  const loadMore = () => {
    if (hasMore) {
      const nextPage = page + 1;
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
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);

  const confirmLeaveGroup = async () => {
    try {
      await api.leaveGroup(groupId);
      setMembers((prevMembers) =>
        prevMembers.filter((member) => member.user.id !== user?.id)
      );
      api.clearGroupsCache();
      toast.success("Você saiu do grupo com sucesso!");
      router.push("/");
      setShowLeaveDialog(false);
    } catch (error) {
      console.error("Erro ao sair do grupo:", error);
      toast.error("Erro ao sair do grupo");
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
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 w-full gap-6">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="h-16 w-16 rounded-full overflow-hidden bg-orange-100 flex items-center justify-center shrink-0">
            <Image
              src={group.imageUrl || "/placeholder-groups.png"}
              alt={group.name}
              width={64}
              height={64}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <h1 className="text-3xl font-bold">{group.name}</h1>
            <p className="line-clamp-2 text-zinc-600 break-words max-w-full md:max-w-[420px]">
              {group.description}
            </p>
          </div>
        </div>
        {user && isAdmin ? (
          <div className="flex items-center gap-4 mt-4 md:mt-0 shrink-0">
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
          <SetListList
            groupId={groupId}
            setlists={setlists}
            userPermissions={permission}
          />
        </TabsContent>
        <TabsContent value="members">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Membros</h2>
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
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-2">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between px-4 py-3 rounded-md border hover:shadow transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative h-9 w-9 border rounded-full">
                      {member?.user.imageUrl ? (
                        <Image
                          src={member?.user.imageUrl}
                          alt="User"
                          className="rounded-full"
                          fill
                          style={{ objectFit: "cover" }}
                          priority
                        />
                      ) : (
                        <div className="relative w-full h-full">
                          <Image
                            src="/placeholder-user.png"
                            alt="User"
                            className="rounded-full"
                            fill
                            style={{ objectFit: "cover" }}
                            priority
                          />
                        </div>
                      )}
                    </div>
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVerticalIcon className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="">
                        <DropdownMenuLabel>Mais Opções</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              className="cursor-pointer text-xs flex items-center"
                              onSelect={(e) => e.preventDefault()}
                            >
                              <DoorOpen className="mx-2 h-4 w-4" />
                              Remover Membro
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogTitle>
                              Você tem certeza?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Você realmente deseja remover este membro do
                              grupo? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>{" "}
                            <div className="flex justify-end gap-2 mt-4">
                              <AlertDialogAction asChild>
                                <Button
                                  variant="destructive"
                                  onClick={() =>
                                    handleRemoveMember(member.user.id)
                                  }
                                >
                                  Remover
                                </Button>
                              </AlertDialogAction>
                              <Button
                                variant="outline"
                                onClick={() => setShowLeaveDialog(false)}
                              >
                                Cancelar
                              </Button>
                            </div>
                          </AlertDialogContent>
                        </AlertDialog>
                        <DropdownMenuItem className="cursor-pointer text-xs flex items-center">
                          <Select
                            onValueChange={(value) =>
                              handlePermissionChange(member.user.id, value)
                            }
                            value={member.permission}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder={member.permission} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="view">Vizualizar</SelectItem>
                              <SelectItem value="edit">Editar</SelectItem>
                            </SelectContent>
                          </Select>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <div className="flex items-center gap-2 px-2 py-1 rounded-md text-sm font-medium">
                      {member.permission === "admin" && (
                        <Crown className="h-4 w-4 text-orange-500" />
                      )}
                      {member.permission === "edit" && (
                        <Edit className="h-4 w-4 text-orange-500" />
                      )}
                      {member.permission === "view" && (
                        <Eye className="h-4 w-4 text-orange-500" />
                      )}
                    </div>
                  )}
                </div>
              ))}
              <Button asChild variant={"ghost"}>
                <Link
                  href={`/groups/${groupId}/invite`}
                  className="w-full px-4 py-7 rounded-md border hover:shadow transition-shadow"
                >
                  <Plus className="h-4 w-4" />
                  Convidar Membros
                </Link>
              </Button>{" "}
              <AlertDialog
                open={showLeaveDialog}
                onOpenChange={setShowLeaveDialog}
              >
                <AlertDialogTrigger asChild>
                  <Button
                    variant={"ghost"}
                    className="w-full px-4 py-7 rounded-md border hover:shadow transition-shadow text-red-400"
                  >
                    <DoorOpen className="h-4 w-4" />
                    Sair do Grupo
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Você realmente deseja sair deste grupo? Você não poderá mais
                    acessar as músicas e setlists.
                  </AlertDialogDescription>{" "}
                  <div className="flex justify-end gap-2 mt-4">
                    <AlertDialogAction asChild>
                      <Button variant="destructive" onClick={confirmLeaveGroup}>
                        Sair
                      </Button>
                    </AlertDialogAction>
                    <Button
                      variant="outline"
                      onClick={() => setShowLeaveDialog(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
