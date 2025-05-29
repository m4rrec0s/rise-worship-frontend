"use client";

import { useState, useRef, ChangeEvent } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import useApi from "../hooks/use-api";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import Image from "next/image";
import { Camera, ChevronLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const CreateGroupPage = () => {
  const api = useApi();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

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

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Verificar tipo de arquivo
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem válida");
      return;
    }

    // Verificar tamanho (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem muito grande. Máximo de 5MB.");
      return;
    }

    setImageFile(file);

    // Criar preview da imagem
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("O nome do grupo é obrigatório");
      return;
    }

    try {
      setLoading(true);

      // Criar FormData para enviar dados + arquivo
      const groupFormData = new FormData();
      groupFormData.append("name", formData.name);
      groupFormData.append("description", formData.description);

      if (imageFile) {
        groupFormData.append("image", imageFile);
      }
      const response = await api.createGroup(groupFormData);

      // Invalidar todos os caches relacionados a grupos
      api.clearAllGroupCaches();

      toast.success("Grupo criado com sucesso!");
      router.push(`/groups/${response.id}`);
    } catch (error) {
      console.error("Erro ao criar grupo:", error);
      toast.error("Não foi possível criar o grupo. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <section className="py-8 bg-background">
      <div className="w-full px-5">
        <Button onClick={handleBack} variant={"ghost"} className="mb-4">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>
      <div className="max-w-md mx-auto bg-card shadow-lg rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Novo Grupo</h1>

        <form onSubmit={handleSubmit}>
          {/* Upload da imagem */}
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
              Adicionar foto de capa
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

          {/* Campo do nome */}
          <div className="mb-4">
            <Label
              htmlFor="name"
              className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 block"
            >
              Nome do Grupo
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Digite o nome do grupo"
              className="border-gray-300 focus:ring-orange-500 focus:orange-orange-500"
              required
            />
          </div>

          {/* Campo da descrição */}
          <div className="mb-6">
            <Label
              htmlFor="description"
              className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 block"
            >
              Descrição
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Descreva o propósito do grupo"
              className="border-gray-300 focus:ring-orange-500 focus:border-orange-500 min-h-[100px]"
            />
          </div>

          {/* Botão de criar */}
          <Button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {loading ? "Criando..." : "Criar Grupo"}
          </Button>
        </form>
      </div>
    </section>
  );
};

export default CreateGroupPage;
