"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, Plus, Search } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/app/components/ui/card";
import { useState, useEffect } from "react";
import { useApi } from "@/app/hooks/use-api";
import { Group } from "@/app/types/group";
import { Music } from "@/app/types/music";
import { LoadingIcon } from "@/app/components/loading-icon";

export default function SongsPage() {
  const params = useParams();
  const groupId = params.groupId as string;
  const api = useApi();

  const [isLoading, setIsLoading] = useState(true);
  const [group, setGroup] = useState<Group | null>(null);
  const [allSongs, setAllSongs] = useState<Music[]>([]);
  const [filteredSongs, setFilteredSongs] = useState<Music[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Buscar dados do grupo
        const groupData = await api.getGroupById(groupId);
        setGroup(groupData);

        // Buscar músicas do grupo
        const musicsData = await api.getAllMusicsByGroup(groupId);
        setAllSongs(musicsData);
        setFilteredSongs(musicsData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  useEffect(() => {
    // Filtrar músicas conforme pesquisa
    if (searchQuery.trim() === "") {
      setFilteredSongs(allSongs);
    } else {
      const filtered = allSongs.filter(
        (song) =>
          song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          song.author.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSongs(filtered);
    }
  }, [searchQuery, allSongs]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center min-h-[60vh]">
        <LoadingIcon />
      </div>
    );
  }

  if (!group) {
    return <div className="container mx-auto py-8">Grupo não encontrado</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-2 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/groups/${groupId}`}>
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Todas as Músicas - {group.name}</h1>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar músicas..."
            className="pl-10"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        <Button asChild className="bg-orange-500 hover:bg-orange-600">
          <Link href={`/groups/${groupId}/create-music`}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Música
          </Link>
        </Button>
      </div>

      {filteredSongs.length === 0 ? (
        <div className="text-center py-12">
          {searchQuery.trim() === "" ? (
            <>
              <h2 className="text-xl font-semibold mb-2">
                Nenhuma música encontrada
              </h2>
              <p className="text-muted-foreground mb-6">
                Comece adicionando músicas ao seu grupo de louvor.
              </p>
              <Button asChild className="bg-orange-500 hover:bg-orange-600">
                <Link href={`/groups/${groupId}/create-music`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Primeira Música
                </Link>
              </Button>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold mb-2">
                Nenhum resultado encontrado
              </h2>
              <p className="text-muted-foreground mb-6">
                Não foi encontrada nenhuma música com {`"${searchQuery}"`}.
              </p>
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Limpar Busca
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredSongs.map((song) => (
            <Card key={song.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="py-4">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg">{song.title}</CardTitle>
                    <CardDescription>{song.author}</CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-muted-foreground">
                      BPM: {song.bpm || "N/A"}
                    </div>
                    <div className="bg-orange-100 text-orange-800 px-2 py-1 rounded-md text-sm font-medium">
                      Tom: {song.tone}
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
