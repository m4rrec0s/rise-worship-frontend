"use client";

import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Button } from "@/app/components/ui/button";
import { useRef, useState } from "react";
import { Setlist } from "@/app/types/setlist";
import { Music } from "@/app/types/music";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/context/auth-context";
import { toast } from "sonner";
import useApi from "@/app/hooks/use-api";
import { Textarea } from "@/app/components/ui/textarea";
import Image from "next/image";
import { Camera } from "lucide-react";

const CreateSetlistPage = () => {
  const params = useParams();
  const router = useRouter();
  const groupId = params.groupId as string;
  const { user } = useAuth();
  const { createSetList, clearSetlistsCache } = useApi();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) {
    router.push("/login");
  }

  if (!groupId) {
    toast.error("Grupo não encontrado");
    router.push("/groups");
  }

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<{
    title: string;
    groupId: string;
    description: string;
    image?: File | null;
    createdBy: string;
    musics: Music[];
  }>({
    title: "",
    groupId: groupId,
    description: "",
    image: null,
    createdBy: user?.id || "",
    musics: [],
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem válida");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem muito grande. Máximo de 5MB.");
      return;
    }

    setFormData((prevData) => ({
      ...prevData,
      image: file,
    }));

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    try {
      setLoading(true);
      const form = new FormData();
      form.append("title", formData.title);
      form.append("groupId", formData.groupId);
      form.append("description", formData.description);
      form.append("createdBy", formData.createdBy);
      if (formData.image) {
        form.append("image", formData.image);
      }

      await createSetList(form);
      clearSetlistsCache();
      toast.success("Setlist criada com sucesso!");
      router.push(`/groups/${groupId}`);
    } catch (error) {
      toast.error("Erro ao criar setlist. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full h-full">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold">Criação de SetList</h1>

        <p className="text-gray-500 mt-2">
          Esta página permite que você crie uma nova setlist para o seu grupo.
          Preencha os detalhes necessários e salve a setlist para que ela possa
          ser usada em futuros eventos.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="mb-6 flex flex-col items-center">
            <div
              onClick={handleImageClick}
              className="relative cursor-pointer group w-32 h-32 rounded-full overflow-hidden bg-muted flex items-center justify-center border-2 border-orange-200 hover:border-orange-400 transition-all mb-2"
            >
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt="Preview da imagem"
                  fill
                  style={{ objectFit: "cover" }}
                  className="group-hover:opacity-80 transition-opacity"
                />
              ) : (
                <Camera className="w-12 h-12 text-orange-400 group-hover:text-orange-500 transition-colors" />
              )}

              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-sm font-medium transition-opacity">
                Alterar foto
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-200 mb-1">
              Adicionar imagem da Setlist
            </p>{" "}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
              aria-label="Upload de imagem de capa"
              title="Upload de imagem de capa"
            />
          </div>
          <div>
            <Label htmlFor="title" className="text-sm font-semibold mb-2">
              Título
            </Label>
            <Input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="Digite o título da setlist"
            />
          </div>
          <div>
            <Label htmlFor="description" className="text-sm font-semibold mb-2">
              Descrição
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              className="w-full"
              placeholder="Digite a descrição da setlist"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-50 transition-colors"
            disabled={!formData.title || !formData.description || loading}
          >
            Criar Setlist
          </Button>
        </form>
      </div>
    </section>
  );
};

export default CreateSetlistPage;
