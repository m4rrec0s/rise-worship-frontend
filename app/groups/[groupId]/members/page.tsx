"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Plus,
  MoreVerticalIcon,
  Edit,
  Eye,
  Crown,
  DoorOpen,
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

  const [members, setMembers] = useState<MemberData[]>([]);
  const [updatingPermission, setUpdatingPermission] = useState<string | null>(
    null
  );
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
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
      }
    };

    if (user) {
      fetchMembers();
    }
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
                  {/* Permission Badge */}
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

                  {/* Actions for Admin */}
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

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
            <Button
              asChild
              variant="outline"
              className="h-14 border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-orange-300 dark:hover:border-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/20"
            >
              <Link href={`/groups/${groupId}/invite`}>
                <Plus className="mr-2 h-5 w-5" />
                Convidar Membros
              </Link>
            </Button>

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
