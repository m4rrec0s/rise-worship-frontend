"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, ImageIcon, Search } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
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
import { useApi } from "@/app/hooks/use-api";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { LoadingIcon } from "@/app/components/loading-icon";
import Image from "next/image";
import Editor from "react-simple-code-editor";
import { transpose, keys, wrap } from "@hrgui/chord-charts";
import type { Group } from "@/app/types/group";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/components/ui/alert-dialog";

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
}

interface ExtractedData {
  title: string;
  author: string;
  lyrics: string;
}

interface ChordSegment {
  chord: string;
  lineIndex: number;
  charOffset: number;
}

interface Cipher {
  key: string;
  segments: ChordSegment[];
}

interface KeysSelectProps {
  value: string;
  onChange: (value: string) => void;
}

function KeysSelect({ value, onChange }: KeysSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Selecione um tom" />
      </SelectTrigger>
      <SelectContent>
        {keys.map((key) => (
          <SelectItem key={key.name} value={key.name}>
            {key.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function CreateMusicPage() {
  const params = useParams();
  const router = useRouter();
  const api = useApi();
  const groupId = params.groupId;

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [group, setGroup] = useState<Group | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [extractUrl, setExtractUrl] = useState<string>("");
  const [showResults, setShowResults] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showCipherDialog, setShowCipherDialog] = useState<boolean>(false);
  const [createdMusicId, setCreatedMusicId] = useState<string>("");

  const [formData, setFormData] = useState<{
    title: string;
    author: string;
    tone: string;
    bpm: string;
    lyrics: string;
    links: { youtube: string; spotify: string; deezer: string };
  }>({
    title: "",
    author: "",
    tone: "C",
    bpm: "",
    lyrics: "",
    links: { youtube: "", spotify: "", deezer: "" },
  });

  useEffect(() => {
    let isMounted = true;
    const fetchGroup = async () => {
      try {
        setIsLoading(true);
        const groupData = await api.getGroupById(String(groupId));
        if (isMounted) setGroup(groupData);
      } catch (error) {
        console.error("Erro ao carregar dados do grupo:", error);
        if (isMounted) toast.error("Erro ao carregar dados do grupo");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchGroup();
    return () => {
      isMounted = false;
    };
  }, [groupId, api]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Por favor, digite algo para buscar");
      return;
    }
    try {
      setIsSearching(true);
      setShowResults(true);
      setSearchResults([]);
      const results = await api.searchLyrics(searchQuery);
      if (Array.isArray(results) && results.length > 0) {
        setSearchResults(results);
      } else {
        toast.info("Nenhuma música encontrada com este termo");
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Erro ao buscar letras:", error);
      toast.error("Erro ao buscar letras de música");
    } finally {
      setIsSearching(false);
    }
  };

  const handleExtractLyrics = async (url: string) => {
    if (!url || url.trim() === "") {
      toast.error("Por favor, insira uma URL válida");
      return;
    }
    try {
      toast.info("Extraindo letra, por favor aguarde...");
      const result = await api.extractLyrics(url);
      if (result && result.lyrics) {
        setFormData((current) => ({
          ...current,
          lyrics: result.lyrics,
          title: result.title || current.title,
          author: result.author || current.author,
        }));
        toast.success("Letra extraída com sucesso!");
      } else {
        toast.error("Não foi possível extrair a letra.");
      }
    } catch (error) {
      console.error("Erro ao extrair letra:", error);
      toast.error("Não foi possível extrair a letra desta URL");
    } finally {
      setExtractUrl("");
    }
  };

  const handleSelectSong = async (song: SearchResult) => {
    setShowResults(false);
    if (song.link) {
      try {
        toast.info("Obtendo letra completa, por favor aguarde...");
        const extractedData = await api.extractLyrics(song.link);
        if (extractedData && extractedData.lyrics) {
          setFormData((current) => ({
            ...current,
            lyrics: extractedData.lyrics,
            title: extractedData.title || current.title,
            author: extractedData.author || current.author,
          }));
          toast.success("Letra extraída com sucesso!");
        } else {
          toast.error("Não foi possível obter a letra completa desta música");
        }
      } catch (error) {
        console.error("Erro ao extrair letra da música:", error);
        toast.error("Não foi possível obter a letra completa desta música");
      }
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const safeValue = value ?? "";
    if (
      name === "links.youtube" ||
      name === "links.spotify" ||
      name === "links.deezer"
    ) {
      setFormData((prev) => ({
        ...prev,
        links: {
          ...prev.links,
          [name.split(".")[1]]: safeValue,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: safeValue,
      }));
    }
  };

  const handleToneChange = (value: string) => {
    setFormData({
      ...formData,
      tone: value,
    });
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
      setSelectedImage(file);
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
      setPreviewImage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const musicData = new FormData();
      musicData.append("title", formData.title);
      musicData.append("author", formData.author);
      musicData.append("tone", formData.tone);
      musicData.append("lyrics", formData.lyrics);
      if (formData.bpm) musicData.append("bpm", formData.bpm);
      if (selectedImage) musicData.append("image", selectedImage);
      musicData.append("links", JSON.stringify(formData.links));

      const result = await api.createMusic(String(groupId), musicData);
      toast.success("Música adicionada com sucesso!");

      if (result && result.id) {
        setCreatedMusicId(result.id);
        setShowCipherDialog(true);
      } else {
        router.push(`/groups/${groupId}`);
      }
    } catch (error) {
      console.error("Erro ao adicionar música:", error);
      let errorMessage = "Tente novamente mais tarde.";
      if (error instanceof AxiosError && error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      toast.error(`Erro ao adicionar música: ${errorMessage}`);
    }
  };
  const handleGoToCipherEdit = () => {
    router.push(`/groups/${groupId}/music/${createdMusicId}/edit-cipher`);
  };

  const handleSkipCipherEdit = () => {
    router.push(`/groups/${groupId}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center min-h-[60vh]">
        <LoadingIcon />
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
      <div className="flex items-center gap-2 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/groups/${groupId}`}>
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">
          Adicionar Nova Música - {group.name}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Buscar Letra</CardTitle>
          <CardDescription>
            Busque por uma música para preencher automaticamente letra e
            detalhes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Busque por título ou artista..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button
              onClick={handleSearch}
              className="bg-orange-500 hover:bg-orange-600"
              disabled={isSearching}
            >
              {isSearching ? <LoadingIcon /> : "Buscar"}
            </Button>
          </div>

          <div className="mt-4">
            <Label>Ou cole um link para extrair a letra:</Label>
            <div className="flex gap-2 mt-1">
              <Input
                placeholder="Ex: https://letras.mus.br/artista/musica/"
                value={extractUrl}
                onChange={(e) => setExtractUrl(e.target.value)}
              />
              <Button
                onClick={() => handleExtractLyrics(extractUrl)}
                variant="outline"
              >
                Extrair
              </Button>
            </div>
          </div>

          {showResults && (
            <div className="mt-4 border rounded-md divide-y">
              {isSearching ? (
                <div className="p-8 flex justify-center">
                  <LoadingIcon />
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  Nenhum resultado encontrado para {`${searchQuery}`}
                </div>
              ) : (
                searchResults.map((song, index) => (
                  <div
                    key={index}
                    className="p-3 hover:bg-orange-50 dark:hover:bg-neutral-600 cursor-pointer"
                    onClick={() => handleSelectSong(song)}
                  >
                    <div className="font-medium">{song.title}</div>
                    <div className="text-sm text-muted-foreground w-full truncate">
                      {song.snippet || "Sem descrição disponível"}
                    </div>
                    {song.link && (
                      <Link
                        href={song.link}
                        className="text-xs mt-1 text-blue-400"
                      >
                        {song.link}
                      </Link>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Detalhes da Música</CardTitle>
            <CardDescription>Preencha as informações da música</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título da Música</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="author">Autor/Artista</Label>
                <Input
                  id="author"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tone">Tom</Label>
                <KeysSelect value={formData.tone} onChange={handleToneChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bpm">Andamento (BPM)</Label>
                <Input
                  id="bpm"
                  name="bpm"
                  type="number"
                  value={formData.bpm}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Imagem da Música (Opcional)</Label>
              <div className="flex flex-col items-center p-4 border-2 border-dashed rounded-md border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
                {previewImage ? (
                  <div className="flex flex-col items-center gap-3 w-full">
                    <Image
                      src={previewImage}
                      alt="Preview"
                      className="max-w-full max-h-48 object-contain rounded-md"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleRemoveImage}
                      size="sm"
                    >
                      Remover imagem
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 w-full">
                    <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                    <Label
                      htmlFor="imageInput"
                      className="cursor-pointer text-center bg-muted/70 hover:bg-muted w-full py-2 rounded-md transition-colors"
                    >
                      Clique para selecionar uma imagem
                    </Label>
                    <Input
                      id="imageInput"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <span className="text-xs text-muted-foreground">
                      Formatos suportados: JPG, PNG, GIF. Tamanho máximo: 5MB
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Links</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="youtube" className="text-xs">
                    YouTube{" "}
                    <span className="text-muted-foreground">
                      (thumbnail será usada como imagem)
                    </span>
                  </Label>
                  <Input
                    id="youtube"
                    name="links.youtube"
                    value={formData.links.youtube}
                    onChange={handleInputChange}
                    placeholder="https://youtube.com/watch?v="
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="spotify" className="text-xs">
                    Spotify
                  </Label>
                  <Input
                    id="spotify"
                    name="links.spotify"
                    value={formData.links.spotify}
                    onChange={handleInputChange}
                    placeholder="https://open.spotify.com/track/"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deezer" className="text-xs">
                    Deezer
                  </Label>
                  <Input
                    id="deezer"
                    name="links.deezer"
                    value={formData.links.deezer}
                    onChange={handleInputChange}
                    placeholder="https://www.deezer.com/track/"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lyrics">Letra</Label>
              <Textarea
                id="lyrics"
                name="lyrics"
                value={formData.lyrics}
                onChange={handleInputChange}
                rows={10}
                required
              />
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" asChild>
            <Link href={`/groups/${groupId}`}>Cancelar</Link>
          </Button>
          <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
            Salvar Música
          </Button>
        </div>
      </form>

      <AlertDialog open={showCipherDialog} onOpenChange={setShowCipherDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Adicionar Cifra</AlertDialogTitle>
            <AlertDialogDescription>
              A música foi criada com sucesso! Deseja adicionar a cifra agora ou
              deixar para depois?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleSkipCipherEdit}>
              Deixar para depois
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleGoToCipherEdit}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Adicionar agora
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
