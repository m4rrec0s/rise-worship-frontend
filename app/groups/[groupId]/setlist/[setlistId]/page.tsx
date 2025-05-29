"use client";

import { LoadingIcon } from "@/app/components/loading-icon";
import MusicItem from "@/app/components/musics/music-item";
import { Button } from "@/app/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/app/components/ui/alert-dialog";
import { useAuth } from "@/app/context/auth-context";
import useApi from "@/app/hooks/use-api";
import { Setlist } from "@/app/types/setlist";
import { User } from "@/app/types/user";
import { ChevronLeft, Trash2, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface MemberData {
  id: string;
  permission: string;
  user: User;
}

const SetListPage = () => {
  const params = useParams();
  const router = useRouter();
  const { getSetListById, getGroupMembers, deleteSetList } = useApi();
  const [setlist, setSetlist] = useState<Setlist | null>(null);
  const { user } = useAuth();
  const [permission, setPermission] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { clearSetlistsCache } = useApi();

  const groupId = params.groupId as string;
  const setlistId = params.setlistId as string;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const setlistData = await getSetListById(setlistId);
        setSetlist(setlistData);

        const membersResponse = await getGroupMembers(groupId);

        const permissionFound = membersResponse.find(
          (member: MemberData) => member.user.id === user?.id
        );

        if (permissionFound) {
          const userPermission = permissionFound.permission;
          setPermission(userPermission);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error("Erro ao carregar dados");
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setlistId]);
  const handleBack = () => {
    clearSetlistsCache();
    router.push(`/groups/${groupId}`);
  };

  const handleDeleteSetlist = async () => {
    setIsDeleting(true);
    try {
      await deleteSetList(setlistId);
      clearSetlistsCache();
      toast.success("Setlist excluída com sucesso!");
      router.push(`/groups/${groupId}`);
    } catch (error) {
      console.error("Erro ao excluir setlist:", error);
      toast.error("Erro ao excluir setlist");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <section>
      <div className="container mx-auto py-8 px-4">
        <Button
          variant="link"
          onClick={handleBack}
          className="mb-4 text-orange-500"
        >
          <ChevronLeft className="mr-1" />
          <span>Voltar</span>
        </Button>{" "}
        {setlist ? (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-20 w-20 rounded-lg overflow-hidden bg-orange-100 flex items-center justify-center">
                <Image
                  src={setlist.imageUrl || "/images/default-setlist.png"}
                  alt="Setlist Image"
                  width={80}
                  height={80}
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-bold mb-4">{setlist.title}</h1>
                    <p>{setlist.description}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Criado em:{" "}
                      {new Date(setlist.createdAt).toLocaleDateString()} por{" "}
                      <strong>{setlist.creator?.name}</strong>
                    </p>
                  </div>
                  {(permission === "admin" || permission === "edit") && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4" />
                          Excluir Setlist
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        {" "}
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir Setlist</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir a setlist &quot;
                            {setlist.title}&quot;? Esta ação não pode ser
                            desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteSetlist}
                            disabled={isDeleting}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            {isDeleting ? "Excluindo..." : "Excluir"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-semibold mt-6">Músicas</h2>
              {(permission === "admin" || permission === "edit") && (
                <Link
                  href={`/groups/${groupId}/setlist/${setlistId}/add-music`}
                  className="text-sm text-orange-500 hover:underline cursor-pointer"
                >
                  <Button
                    variant="outline"
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Música
                  </Button>
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2  gap-4 mt-4">
              {setlist.musics &&
                setlist.musics.map((music) => (
                  <MusicItem groupId={groupId} item={music} key={music.id} />
                ))}
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center min-h-[60vh]">
            <LoadingIcon />
          </div>
        )}
      </div>
    </section>
  );
};

export default SetListPage;
