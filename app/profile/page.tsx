"use client";

import { ChevronLeft } from "lucide-react";
import { useAuth } from "../context/auth-context";
import { Button } from "../components/ui/button";
import Image from "next/image";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { useRouter } from "next/navigation";
import useApi from "../hooks/use-api";
import { toast } from "sonner";
import { useState, useRef } from "react";

const ProfilePage = () => {
  const { user, updateUser: setUserContext } = useAuth();
  const { updateUser, invalidateCache, getMe } = useApi();
  const router = useRouter();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBackClick = () => {
    router.back();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;

    if (!name) {
      toast.error("O nome é obrigatório.");
      return;
    }
    formData.delete("image");
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      setLoading(true);
      await updateUser(formData);
      invalidateCache();
      const updatedUser = await getMe();
      setUserContext(updatedUser.user || updatedUser);
      router.refresh();
      toast.success("Perfil atualizado com sucesso!");
      setImagePreview(null);
      setImageFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Erro ao atualizar perfil. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
      <header className="w-full py-5 px-5 mb-4 border-b flex items-center">
        <Button
          variant="link"
          onClick={handleBackClick}
          className="flex items-center justify-start"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          <h1 className="font-bold text-lg">Editar Perfil</h1>
        </Button>
      </header>

      <section>
        <div className="flex flex-col items-center w-full">
          <div
            className="relative w-24 h-24 mb-4 cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
              aria-label="Upload de imagem de perfil"
              title="Upload de imagem de perfil"
              ref={fileInputRef}
              name="image"
            />
            <Image
              src={imagePreview || user?.imageUrl || "/placeholder-user.png"}
              alt="Profile"
              fill
              sizes="100%"
              className="rounded-full object-cover"
            />
          </div>

          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            {user?.name}
          </h2>
          <p className="text-gray-500">{user?.email}</p>
        </div>

        <form
          onSubmit={handleFormSubmit}
          className="mt-6 w-full mx-auto px-8 border-t pt-4 max-w-2xl"
        >
          <h3 className="text-base font-semibold">Dados Pessoais</h3>
          <p className="text-sm text-gray-500 mb-4">
            Atualize suas informações pessoais para manter seu perfil
            atualizado.
          </p>
          <div className="mb-4">
            <Label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-400"
            >
              Nome
            </Label>
            <Input
              type="text"
              id="name"
              name="name"
              defaultValue={user?.name}
              className="mt-1 block w-full border-none focus-visible:outline-none focus-visible:ring-0 focus-visible:border-none"
            />
          </div>

          <div className="mb-4">
            <Label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-400"
            >
              Email
            </Label>
            <Input
              type="email"
              id="email"
              name="email"
              defaultValue={user?.email}
              readOnly
              className="mt-1 block w-full border-none focus-visible:outline-none focus-visible:ring-0 focus-visible:border-none bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-orange-500 text-white"
            disabled={loading}
          >
            {!loading ? "Salvar Alterações" : "Salvando..."}
          </Button>
        </form>
      </section>
    </div>
  );
};

export default ProfilePage;
