"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  Loader2,
  Image as ImageIcon,
  Edit,
  Trash,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import Image from "next/image";
import { useApi } from "@/app/hooks/use-api";
import { Group } from "@/app/types/group";
import { toast } from "sonner";
import { LoadingIcon } from "@/app/components/loading-icon";
import { useAuth } from "@/app/context/auth-context";
import { User } from "@/app/types/user";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/app/components/ui/alert-dialog";

interface GroupMember {
  user: User;
  permission: string;
}

export default function EditGroupPage() {
  const params = useParams();
  const router = useRouter();
  const api = useApi();
  const { user } = useAuth();
  const groupId = params.groupId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [group, setGroup] = useState<Group | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const fetchGroupData = async () => {
    try {
      setIsLoading(true);
      const groupData = await api.getGroupById(groupId);
      setGroup(groupData);

      const membersData = await api.getGroupMembers(groupId);
      const currentUser = membersData.find(
        (member: GroupMember) => member.user.id === user?.id
      );

      const userIsAdmin = currentUser?.permission === "admin";
      setIsAdmin(userIsAdmin);

      if (!userIsAdmin) {
        toast.error("Você não tem permissão para editar este grupo");
        router.push(`/groups/${groupId}`);
        return;
      }

      setFormData({
        name: groupData.name || "",
        description: groupData.description || "",
      });

      // Definir imagem atual como preview se existir
      if (groupData.imageUrl) {
        setPreviewImage(groupData.imageUrl);
      }
    } catch (error) {
      console.error("Erro ao carregar dados do grupo:", error);
      toast.error("Erro ao carregar dados do grupo");
      router.push(`/groups/${groupId}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.match("image.*")) {
        toast.error("Por favor, selecione apenas arquivos de imagem");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("A imagem deve ser menor que 5MB");
        return;
      }

      if (previewImage && !previewImage.includes("http")) {
        URL.revokeObjectURL(previewImage);
      }

      setSelectedImage(file);

      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);

      toast.success("Imagem selecionada com sucesso!");
    }
  };
  const handleRemoveImage = () => {
    setSelectedImage(null);

    if (previewImage && !previewImage.includes("http")) {
      URL.revokeObjectURL(previewImage);
    }

    setPreviewImage(group?.imageUrl || null);
    toast.info("Alterações na imagem foram descartadas");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error("O nome do grupo é obrigatório");
      return;
    }

    try {
      setIsSaving(true);

      const groupData = new FormData();
      groupData.append("name", formData.name);

      if (formData.description) {
        groupData.append("description", formData.description);
      }
      if (selectedImage) {
        groupData.append("image", selectedImage);
        console.log("Enviando nova imagem:", selectedImage.name);
      }

      await api.updateGroup(groupId, groupData);

      api.clearGroupsCache();

      toast.success("Grupo atualizado com sucesso!");
      router.push(`/groups/${groupId}`);
    } catch (error) {
      console.error("Erro ao atualizar grupo:", error);
      toast.error("Erro ao atualizar grupo");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center min-h-[60vh]">
        <LoadingIcon />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-5">
      <div className="flex items-center gap-2 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/groups/${groupId}`}>
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Editar Grupo</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Grupo</CardTitle>
            <CardDescription>
              Edite os detalhes do seu grupo de louvor
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Grupo*</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Nome do grupo"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Uma breve descrição sobre o grupo"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Imagem do Grupo</Label>
              <div className="flex flex-col items-center p-4 border-2 border-dashed rounded-md border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
                {previewImage ? (
                  <div className="flex flex-col items-center gap-3 w-full">
                    <div className="relative h-40 w-40 rounded-full overflow-hidden">
                      <Image
                        src={previewImage}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>{" "}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="center">
                        <DropdownMenuItem
                          onClick={handleRemoveImage}
                          className="text-red-500"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Remover Imagem
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Label
                            htmlFor="imageInputDropdown"
                            className="cursor-pointer flex items-center w-full"
                          >
                            <ImageIcon className="mr-2 h-4 w-4" />
                            Alterar Imagem
                          </Label>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <input
                      id="imageInputDropdown"
                      name="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      aria-label="Upload de imagem"
                      title="Selecione uma nova imagem para o grupo"
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 w-full">
                    <div className="w-full flex justify-center">
                      <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() =>
                        document.getElementById("imageInputBlank")?.click()
                      }
                    >
                      <ImageIcon className="mr-2 h-4 w-4" />
                      Selecionar imagem
                    </Button>
                    <input
                      id="imageInputBlank"
                      name="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      aria-label="Upload de imagem"
                      title="Selecione uma imagem para o grupo"
                      className="hidden"
                    />
                    <span className="text-xs text-muted-foreground">
                      Formatos suportados: JPG, PNG, GIF. Tamanho máximo: 5MB
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" asChild disabled={isSaving}>
            <Link href={`/groups/${groupId}`}>Cancelar</Link>
          </Button>
          <Button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar Alterações"
            )}
          </Button>
          {isAdmin && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="destructive" disabled={isSaving}>
                  <Trash className="mr-2 h-4 w-4" />
                  Excluir Grupo
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Tem certeza que deseja excluir este grupo?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não poderá ser desfeita. Todos os dados
                    relacionados ao grupo serão removidos permanentemente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600 hover:bg-red-700"
                    onClick={async () => {
                      try {
                        setIsSaving(true);
                        await api.deleteGroup(groupId);
                        toast.success("Grupo excluído com sucesso!");
                        router.push("/groups");
                      } catch (error) {
                        toast.error("Erro ao excluir grupo");
                      } finally {
                        setIsSaving(false);
                      }
                    }}
                  >
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </form>
    </div>
  );
}
