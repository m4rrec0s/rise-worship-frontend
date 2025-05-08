"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ChevronLeft, Plus, Search, Calendar, Loader2 } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/app/components/ui/card";
import { useApi } from "@/app/hooks/use-api";
import { Group } from "@/app/types/group";
import { Setlist } from "@/app/types/setlist";

export default function SetlistsPage() {
  const params = useParams();
  const groupId = params.groupId as string;
  const api = useApi();

  const [isLoading, setIsLoading] = useState(true);
  const [group, setGroup] = useState<Group | null>(null);
  const [allSetlists, setAllSetlists] = useState<Setlist[]>([]);
  const [filteredSetlists, setFilteredSetlists] = useState<Setlist[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Buscar dados do grupo
        const groupData = await api.getGroupById(groupId);
        setGroup(groupData);

        // Buscar setlists do grupo
        const setlistsData = await api.getSetListsByGroup(groupId);
        setAllSetlists(setlistsData);
        setFilteredSetlists(setlistsData);
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
    // Filtrar setlists conforme pesquisa
    if (searchQuery.trim() === "") {
      setFilteredSetlists(allSetlists);
    } else {
      const filtered = allSetlists.filter(
        (setlist) =>
          setlist.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          setlist.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSetlists(filtered);
    }
  }, [searchQuery, allSetlists]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
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
        <h1 className="text-2xl font-bold">Todas as Setlists - {group.name}</h1>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar setlists..."
            className="pl-10"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        <Button asChild className="bg-orange-500 hover:bg-orange-600">
          <Link href={`/groups/${groupId}/create-setlist`}>
            <Plus className="mr-2 h-4 w-4" />
            Criar Setlist
          </Link>
        </Button>
      </div>

      {filteredSetlists.length === 0 ? (
        <div className="text-center py-12">
          {searchQuery.trim() === "" ? (
            <>
              <h2 className="text-xl font-semibold mb-2">
                Nenhuma setlist encontrada
              </h2>
              <p className="text-muted-foreground mb-6">
                Comece criando uma setlist para seu próximo culto.
              </p>
              <Button asChild className="bg-orange-500 hover:bg-orange-600">
                <Link href={`/groups/${groupId}/create-setlist`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Primeira Setlist
                </Link>
              </Button>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold mb-2">
                Nenhum resultado encontrado
              </h2>
              <p className="text-muted-foreground mb-6">
                Não foi encontrada nenhuma setlist com {`${searchQuery}`}.
              </p>
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Limpar Busca
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredSetlists.map((setlist) => (
            <Link
              key={setlist.id}
              href={`/groups/${groupId}/setlists/${setlist.id}`}
              className="block"
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="py-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg">{setlist.title}</CardTitle>
                      <CardDescription>
                        Líder: {setlist.creator?.name || "Desconhecido"}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(setlist.createdAt).toLocaleDateString(
                          "pt-BR"
                        )}
                      </div>
                      <div className="bg-orange-100 text-orange-800 px-2 py-1 rounded-md text-sm font-medium">
                        {setlist.musics?.length || 0} músicas
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
