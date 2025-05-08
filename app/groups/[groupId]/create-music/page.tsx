"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Search, Loader2 } from "lucide-react";
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
import { Group } from "@/app/types/group";
import { toast } from "sonner";

interface SearchResult {
  id: string;
  title: string;
  author: string;
  lyrics: string;
}

export default function CreateMusicPage() {
  const params = useParams();
  const router = useRouter();
  const api = useApi();
  const groupId = params.groupId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [group, setGroup] = useState<Group | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [extractUrl, setExtractUrl] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedSong, setSelectedSong] = useState<SearchResult | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    tone: "C",
    bpm: "",
    lyrics: "",
    cipher: "",
    links: {
      youtube: "",
      spotify: "",
      deezer: "",
    },
  });

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        setIsLoading(true);
        const groupData = await api.getGroupById(groupId);
        setGroup(groupData);
      } catch (error) {
        console.error("Erro ao carregar dados do grupo:", error);
        toast.error("Erro ao carregar dados do grupo");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      try {
        setIsSearching(true);
        setShowResults(true);

        // Chame a API para buscar letras
        const results = await api.searchLyrics(searchQuery);
        setSearchResults(results);
      } catch (error) {
        console.error("Erro ao buscar letras:", error);
        toast.error("Erro ao buscar letras de música");
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }
  };

  const handleExtractLyrics = async (url: string) => {
    if (url) {
      try {
        const result = await api.extractLyrics(url);
        if (result && result.lyrics) {
          setFormData({
            ...formData,
            lyrics: result.lyrics,
            title: result.title || formData.title,
            author: result.artist || formData.author,
          });
          toast.success("Letra extraída com sucesso!");
        }
      } catch (error) {
        console.error("Erro ao extrair letra:", error);
        toast.error("Não foi possível extrair a letra desta URL");
      }
    }
  };

  const handleSelectSong = (song: SearchResult) => {
    setSelectedSong(song);
    setFormData({
      ...formData,
      title: song.title,
      author: song.author,
      lyrics: song.lyrics,
    });
    setShowResults(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      // Para campos aninhados como links.youtube
      const [parent, child] = name.split(".");
      const parentKey = parent as keyof typeof formData;
      const parentValue = formData[parentKey];

      // Check if parentValue is an object before spreading
      if (parentValue && typeof parentValue === "object") {
        setFormData({
          ...formData,
          [parent]: {
            ...parentValue,
            [child]: value,
          },
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleToneChange = (value: string) => {
    setFormData({
      ...formData,
      tone: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Preparar dados para envio
      const musicData = new FormData();
      musicData.append("title", formData.title);
      musicData.append("author", formData.author);
      musicData.append("tone", formData.tone);
      musicData.append("lyrics", formData.lyrics);

      if (formData.bpm) {
        musicData.append("bpm", formData.bpm);
      }

      if (formData.cipher) {
        musicData.append("cipher", formData.cipher);
      }

      // Adicionar links como JSON
      musicData.append("links", JSON.stringify(formData.links));

      // Extrair thumbnail do YouTube se houver link
      if (formData.links.youtube) {
        try {
          const thumbnail = await api.getYoutubeThumbnail(
            formData.links.youtube
          );
          if (thumbnail && thumbnail.url) {
            musicData.append("thumbnail", thumbnail.url);
          }
        } catch (error) {
          console.error("Erro ao obter thumbnail:", error);
          // Continua mesmo sem thumbnail
        }
      }

      // Enviar para a API
      await api.createMusic(groupId, musicData);
      toast.success("Música adicionada com sucesso!");
      router.push(`/groups/${groupId}`);
    } catch (error) {
      console.error("Erro ao salvar música:", error);
      toast.error("Erro ao adicionar música. Tente novamente.");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
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
    <div className="container mx-auto py-8">
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
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                "Buscar"
              )}
            </Button>
          </div>

          <div className="mt-4">
            <Label>Ou cole um link para extrair a letra:</Label>
            <div className="flex gap-2 mt-1">
              <Input
                placeholder="Ex: https://letras.mus.br/artista/musica/"
                name="extractUrl"
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
                  <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  Nenhum resultado encontrado para {`${searchQuery}`}
                </div>
              ) : (
                searchResults.map((song, index) => (
                  <div
                    key={index}
                    className="p-3 hover:bg-orange-50 cursor-pointer"
                    onClick={() => handleSelectSong(song)}
                  >
                    <div className="font-medium">{song.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {song.author}
                    </div>
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
                <Select value={formData.tone} onValueChange={handleToneChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um tom" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="A#">A#</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                    <SelectItem value="C#">C#</SelectItem>
                    <SelectItem value="D">D</SelectItem>
                    <SelectItem value="D#">D#</SelectItem>
                    <SelectItem value="E">E</SelectItem>
                    <SelectItem value="F">F</SelectItem>
                    <SelectItem value="F#">F#</SelectItem>
                    <SelectItem value="G">G</SelectItem>
                    <SelectItem value="G#">G#</SelectItem>
                    <SelectItem value="Am">Am</SelectItem>
                    <SelectItem value="A#m">A#m</SelectItem>
                    <SelectItem value="Bm">Bm</SelectItem>
                    <SelectItem value="Cm">Cm</SelectItem>
                    <SelectItem value="C#m">C#m</SelectItem>
                    <SelectItem value="Dm">Dm</SelectItem>
                    <SelectItem value="D#m">D#m</SelectItem>
                    <SelectItem value="Em">Em</SelectItem>
                    <SelectItem value="Fm">Fm</SelectItem>
                    <SelectItem value="F#m">F#m</SelectItem>
                    <SelectItem value="Gm">Gm</SelectItem>
                    <SelectItem value="G#m">G#m</SelectItem>
                  </SelectContent>
                </Select>
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
              <Label>Links</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="youtube" className="text-xs">
                    YouTube
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

            <div className="space-y-2">
              <Label htmlFor="cipher">Cifra/Acordes (Opcional)</Label>
              <Textarea
                id="cipher"
                name="cipher"
                value={formData.cipher}
                onChange={handleInputChange}
                rows={6}
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
    </div>
  );
}
