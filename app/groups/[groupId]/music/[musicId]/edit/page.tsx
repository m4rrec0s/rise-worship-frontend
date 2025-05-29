"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApi } from "@/app/hooks/use-api";
import { Music } from "@/app/types/music";
import { useAuth } from "@/app/context/auth-context";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { LoadingIcon } from "@/app/components/loading-icon";
import { Textarea } from "@/app/components/ui/textarea";
import { ChevronLeft, ImageIcon, Loader2, Save } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { AxiosError } from "axios";

export default function EditMusicPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.groupId as string;
  const musicId = params.musicId as string;
  const { user } = useAuth();
  const api = useApi();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [music, setMusic] = useState<Music | null>(null);
  const [userPermission, setUserPermission] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    lyrics: "",
    tone: "",
    bpm: "",
    links: {
      youtube: "",
      spotify: "",
      others: [] as string[],
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const musicData = await api.getMusicById(musicId);
        setMusic(musicData);
        setFormData({
          title: musicData.title || "",
          author: musicData.author || "",
          lyrics: musicData.lyrics || "",
          tone: musicData.tone || "",
          bpm: musicData.bpm ? String(musicData.bpm) : "",
          links: {
            youtube: musicData.links?.youtube || "",
            spotify: musicData.links?.spotify || "",
            others: Array.isArray(musicData.links?.others)
              ? musicData.links.others
              : [],
          },
        });

        if (musicData.thumbnail) {
          setPreviewImage(musicData.thumbnail);
        }

        if (user && groupId) {
          const members = await api.getGroupMembers(groupId);
          const currentUser = members.find(
            (member: { user: { id: string }; permission: string }) =>
              member.user.id === user.id
          );

          if (currentUser) {
            setUserPermission(currentUser.permission);

            if (
              currentUser.permission !== "admin" &&
              currentUser.permission !== "view"
            ) {
              toast.error("Você não tem permissão para editar esta música");
              router.push(`/groups/${groupId}/music/${musicId}`);
            }
          } else {
            toast.error("Você não é membro deste grupo");
            router.push(`/groups/${groupId}`);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error("Erro ao carregar dados da música");
        router.push(`/groups/${groupId}/music/${musicId}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId, musicId, user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLinkChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "youtube" | "spotify"
  ) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      links: {
        ...prev.links,
        [type]: value,
      },
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("O título da música é obrigatório");
      return;
    }

    if (!formData.author.trim()) {
      toast.error("O autor da música é obrigatório");
      return;
    }

    if (!formData.lyrics.trim()) {
      toast.error("A letra da música é obrigatória");
      return;
    }

    try {
      setIsSaving(true);

      const musicData = new FormData();
      musicData.append("title", formData.title);
      musicData.append("author", formData.author);
      musicData.append("lyrics", formData.lyrics);
      musicData.append("tone", formData.tone || "");
      if (formData.bpm) {
        musicData.append("bpm", formData.bpm);
      }

      if (selectedImage) {
        musicData.append("image", selectedImage);
      }

      musicData.append(
        "links",
        JSON.stringify({
          youtube: formData.links.youtube,
          spotify: formData.links.spotify,
          others: formData.links.others,
        })
      );

      await api.updateMusic(musicId, musicData);

      toast.success("Música atualizada com sucesso!");
      router.push(`/groups/${groupId}/music/${musicId}`);
    } catch (error) {
      toast.error(
        "Erro ao atualizar música. " +
          ((error as AxiosError<{ error: string }>)?.response?.data?.error ||
            "Tente novamente mais tarde.")
      );
      console.error("Erro ao atualizar música:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[60vh]">
        <LoadingIcon />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-5">
      <div className="flex items-center gap-2 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/groups/${groupId}/music/${musicId}`}>
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Editar Música</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações da Música</CardTitle>
            <CardDescription>Edite os detalhes da música</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Título*</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Título da música"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="author">Autor/Intérprete*</Label>
                <Input
                  id="author"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  placeholder="Nome do autor ou intérprete"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tone">Tom</Label>
                <Input
                  id="tone"
                  name="tone"
                  value={formData.tone}
                  onChange={handleInputChange}
                  placeholder="Ex: C, D, Em, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bpm">BPM</Label>
                <Input
                  id="bpm"
                  name="bpm"
                  type="number"
                  value={formData.bpm}
                  onChange={handleInputChange}
                  placeholder="Batidas por minuto"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="youtube">Link do YouTube</Label>
                <Input
                  id="youtube"
                  value={formData.links.youtube}
                  onChange={(e) => handleLinkChange(e, "youtube")}
                  placeholder="URL do YouTube"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="spotify">Link do Spotify</Label>
                <Input
                  id="spotify"
                  value={formData.links.spotify}
                  onChange={(e) => handleLinkChange(e, "spotify")}
                  placeholder="URL do Spotify"
                />
              </div>{" "}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lyrics">Letra da Música*</Label>
              <Textarea
                id="lyrics"
                name="lyrics"
                value={formData.lyrics}
                onChange={handleInputChange}
                placeholder="Cole a letra aqui..."
                className="min-h-[300px]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Imagem da Música</Label>
              <div className="flex flex-col items-center p-4 border-2 border-dashed rounded-md border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
                {previewImage ? (
                  <div className="flex flex-col items-center gap-3 w-full">
                    <Image
                      src={previewImage}
                      alt="Preview"
                      width={200}
                      height={200}
                      className="rounded-md object-cover w-40 h-40"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() =>
                        document.getElementById("imageInput")?.click()
                      }
                    >
                      <ImageIcon className="mr-2 h-4 w-4" />
                      Alterar imagem
                    </Button>
                    <input
                      id="imageInput"
                      name="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      aria-label="Upload de imagem"
                      title="Selecione uma imagem para a música"
                      className="hidden"
                    />
                    <span className="text-xs text-muted-foreground">
                      Formatos suportados: JPG, PNG, GIF. Tamanho máximo: 5MB
                    </span>
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
                      title="Selecione uma imagem para a música"
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
        </Card>{" "}
        <div className="flex justify-end gap-3">
          <Button variant="outline" asChild disabled={isSaving}>
            <Link href={`/groups/${groupId}/music/${musicId}`}>Cancelar</Link>
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
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
