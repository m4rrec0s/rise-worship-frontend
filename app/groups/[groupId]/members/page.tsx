"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Plus,
  MoreVerticalIcon,
  Edit,
  Eye,
  Crown,
  DoorOpen,
  Loader2,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/app/components/ui/alert-dialog";
import { LoadingIcon } from "@/app/components/loading-icon";
import { User } from "@/app/types/user";

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

export default function GroupMembersPage() {
  const params = useParams();
  const api = useApi();
  const groupId = params.groupId as string;
  const router = useRouter();
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [members, setMembers] = useState<MemberData[]>([]);
  const [updatingPermission, setUpdatingPermission] = useState<string | null>(
    null
  );
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const suggestionsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      setIsLoading(true);

      try {
        const membersResponse = await api.getGroupMembers(groupId);
        setMembers(membersResponse);

        const isUserAdmin = membersResponse.some(
          (member: MemberData) =>
            member.user.id === user?.id && member.permission === "admin"
        );
        setIsAdmin(isUserAdmin);
      } catch (error) {
        console.error("Erro ao carregar membros:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchMembers();
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup timeout on unmount
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      document.removeEventListener("mousedown", handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      toast.success("Permissão atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar permissão:", error);
      toast.error("Erro ao atualizar permissão");
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
      toast.error("Erro ao remover membro");
    }
  };

  const confirmLeaveGroup = async () => {
    try {
      await api.leaveGroup(groupId);
      api.clearGroupsCache();
      toast.success("Você saiu do grupo com sucesso!");
      router.push("/");
      setShowLeaveDialog(false);
    } catch (error) {
      console.error("Erro ao sair do grupo:", error);
      toast.error("Erro ao sair do grupo");
    }
  };
  const handleSearchUsers = useCallback(
    async (query: string) => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      if (!query.includes("@") || query.length < 3) {
        setSearchResults([]);
        setShowSuggestions(false);
        return;
      }
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          setIsSearching(true);
          const users = await api.getUsersByEmail(query);

          const filteredUsers = (users || []).filter(
            (user: User) =>
              !members.some((member) => member.user.id === user.id)
          );

          setSearchResults(filteredUsers);
          setShowSuggestions(true);
        } catch (error) {
          console.error("Erro ao buscar usuários:", error);
          setSearchResults([]);
          setShowSuggestions(false);
        } finally {
          setIsSearching(false);
        }
      }, 300);
    },
    [api, members]
  );

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setSearchQuery("");
    setSearchResults([]);
    setShowSuggestions(false);
  };

  const handleRemoveSelectedUser = () => {
    setSelectedUser(null);
  };
  const handleAddUserToGroup = async () => {
    if (!selectedUser) {
      toast.error("Nenhum usuário selecionado.");
      return;
    }

    const isAlreadyMember = members.some(
      (member) => member.user.id === selectedUser.id
    );
    if (isAlreadyMember) {
      toast.error(`${selectedUser.name} já é membro deste grupo.`);
      return;
    }

    try {
      setIsAddingUser(true);
      await api.addUserToGroup(groupId, {
        userId: selectedUser.id,
        permission: "view",
      });

      const membersResponse = await api.getGroupMembers(groupId, true);
      setMembers(membersResponse);
      toast.success(`${selectedUser.name} foi adicionado ao grupo!`);
      handleCloseModal();
    } catch (error) {
      console.error("Erro ao adicionar usuário ao grupo:", error);
      toast.error("Erro ao adicionar usuário ao grupo");
    } finally {
      setIsAddingUser(false);
    }
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setSearchQuery("");
    setSearchResults([]);
    setShowSuggestions(false);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  };

  const handleInviteMember = async (email: string) => {
    handleSearchUsers(email);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <LoadingIcon size={30} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Membros do Grupo
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mt-1">
            Gerencie os membros e suas permissões
          </p>
        </div>
      </div>

      {members.length === 0 ? (
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardContent className="py-12 text-center">
            <div className="h-16 w-16 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-orange-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Nenhum membro encontrado
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Convide membros para participar do seu grupo de louvor.
            </p>
            <Button
              asChild
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
            >
              <Link href={`/groups/${groupId}/invite`}>
                <Plus className="mr-2 h-4 w-4" />
                Convidar Primeiro Membro
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30">
                    <Image
                      src={member?.user.imageUrl || "/placeholder-user.png"}
                      alt="User"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {member.user.name}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {member.user.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700">
                    {member.permission === "admin" && (
                      <>
                        <Crown className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Admin
                        </span>
                      </>
                    )}
                    {member.permission === "edit" && (
                      <>
                        <Edit className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Editor
                        </span>
                      </>
                    )}
                    {member.permission === "view" && (
                      <>
                        <Eye className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Visualizar
                        </span>
                      </>
                    )}
                  </div>

                  {isAdmin && member.user.id !== user?.id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVerticalIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Gerenciar Membro</DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        <div className="p-2">
                          <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                            Alterar Permissão
                          </label>
                          <Select
                            onValueChange={(value) =>
                              handlePermissionChange(member.user.id, value)
                            }
                            value={member.permission}
                            disabled={updatingPermission === member.user.id}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="view">Visualizar</SelectItem>
                              <SelectItem value="edit">Editor</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <DropdownMenuSeparator />

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600"
                              onSelect={(e) => e.preventDefault()}
                            >
                              <DoorOpen className="mr-2 h-4 w-4" />
                              Remover Membro
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogTitle>Remover Membro</AlertDialogTitle>
                            <AlertDialogDescription>
                              Você tem certeza que deseja remover{" "}
                              <strong>{member.user.name}</strong> do grupo? Esta
                              ação não pode ser desfeita.
                            </AlertDialogDescription>
                            <div className="flex justify-end gap-2 mt-4">
                              <Button
                                variant="outline"
                                onClick={() => setShowLeaveDialog(false)}
                              >
                                Cancelar
                              </Button>
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
                            </div>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
            <AlertDialog open={showModal} onOpenChange={setShowModal}>
              <AlertDialogTrigger asChild disabled={!isAdmin}>
                <Button
                  variant="outline"
                  className="h-14 border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-orange-300 dark:hover:border-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/20"
                >
                  <span className="flex items-center gap-2">
                    <Plus className="mr-2 h-5 w-5" />
                    Convidar Membros
                  </span>
                </Button>
              </AlertDialogTrigger>{" "}
              <AlertDialogContent>
                <AlertDialogTitle>Convidar Membros</AlertDialogTitle>
                <AlertDialogDescription>
                  Digite o email do usuário que você deseja convidar para o
                  grupo.
                </AlertDialogDescription>
                <div className="mt-4 space-y-4">
                  {" "}
                  <div className="relative" ref={suggestionsRef}>
                    <input
                      type="email"
                      placeholder="Digite o email do usuário"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        handleSearchUsers(e.target.value);
                      }}
                      className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />

                    {showSuggestions && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg max-h-40 overflow-y-auto z-10">
                        {isSearching ? (
                          <div className="p-3 text-center text-slate-500">
                            Buscando usuários...
                          </div>
                        ) : searchResults.length > 0 ? (
                          searchResults.map((user) => (
                            <Button
                              key={user.id}
                              onClick={() => handleSelectUser(user)}
                              className="w-full flex items-center gap-3 p-3 hover:bg-slate-100 dark:hover:bg-slate-700 text-left"
                            >
                              <div className="h-8 w-8 rounded-full overflow-hidden bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30">
                                <Image
                                  src={user.imageUrl || "/placeholder-user.png"}
                                  alt={user.name}
                                  width={32}
                                  height={32}
                                  className="object-cover w-full h-full"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                  {user.name}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                  {user.email}
                                </p>
                              </div>
                            </Button>
                          ))
                        ) : (
                          <div className="p-3 text-center text-slate-500">
                            Nenhum usuário encontrado
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {selectedUser && (
                    <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full overflow-hidden bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30">
                          <Image
                            src={
                              selectedUser.imageUrl || "/placeholder-user.png"
                            }
                            alt={selectedUser.name}
                            width={40}
                            height={40}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {selectedUser.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {selectedUser.email}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveSelectedUser}
                        className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                      >
                        ✕
                      </Button>
                    </div>
                  )}
                </div>{" "}
                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={handleCloseModal}>
                    Cancelar
                  </Button>
                  <Button
                    variant="default"
                    onClick={handleAddUserToGroup}
                    disabled={!selectedUser || isAddingUser}
                    className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAddingUser ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adicionando...
                      </>
                    ) : (
                      "Adicionar ao Grupo"
                    )}
                  </Button>
                </div>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog
              open={showLeaveDialog}
              onOpenChange={setShowLeaveDialog}
            >
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="h-14 border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  <DoorOpen className="mr-2 h-5 w-5" />
                  Sair do Grupo
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogTitle>Sair do Grupo</AlertDialogTitle>
                <AlertDialogDescription>
                  Você tem certeza que deseja sair deste grupo? Você não poderá
                  mais acessar as músicas e setlists.
                </AlertDialogDescription>
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowLeaveDialog(false)}
                  >
                    Cancelar
                  </Button>
                  <AlertDialogAction asChild>
                    <Button variant="destructive" onClick={confirmLeaveGroup}>
                      Sair do Grupo
                    </Button>
                  </AlertDialogAction>
                </div>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}
    </div>
  );
}
