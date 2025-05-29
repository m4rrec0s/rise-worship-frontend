"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import useApi from "@/app/hooks/use-api";
import { Music } from "@/app/types/music";
import { Setlist } from "@/app/types/setlist";
import { SetlistMusic } from "@/app/types/setlistMusic";
import { Button } from "@/app/components/ui/button";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Skeleton } from "@/app/components/ui/skeleton";
import { Input } from "@/app/components/ui/input";
import { Card } from "@/app/components/ui/card";
import { toast } from "sonner";

import { ArrowLeft, Search, MusicIcon } from "lucide-react";
import Image from "next/image";

const AddMusicPage = () => {
  const router = useRouter();
  const params = useParams();
  const api = useApi();

  const groupId = params.groupId as string;
  const setlistId = params.setlistId as string;
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [allMusic, setAllMusic] = useState<Music[]>([]);
  const [filteredMusic, setFilteredMusic] = useState<Music[]>([]);
  const [setlist, setSetlist] = useState<Setlist | null>(null);
  const [selectedMusicIds, setSelectedMusicIds] = useState<Set<string>>(
    new Set()
  );
  const dataFetchedRef = useRef(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const setlistData = await api.getSetListById(setlistId);
        setSetlist(setlistData);
        const initialSelected = new Set<string>();
        if (setlistData.musics && setlistData.musics.length > 0) {
          setlistData.musics.forEach((setlistMusic: SetlistMusic) => {
            if (setlistMusic.music?.id) {
              initialSelected.add(setlistMusic.music.id);
            }
          });
        }
        setSelectedMusicIds(initialSelected);
        const musicData = await api.getAllMusicsByGroup(groupId);
        setAllMusic(musicData.data);
        setFilteredMusic(musicData.data);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error("Erro ao carregar músicas. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredMusic(allMusic);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = allMusic.filter(
        (music) =>
          music.title.toLowerCase().includes(query) ||
          music.author.toLowerCase().includes(query) ||
          (music.tags &&
            music.tags.some((tag) => tag.toLowerCase().includes(query)))
      );
      setFilteredMusic(filtered);
    }
  }, [searchQuery, allMusic]);

  const handleMusicToggle = async (
    musicId: string,
    isCurrentlySelected: boolean
  ) => {
    try {
      if (isCurrentlySelected) {
        await api.removeMusicFromSetList(setlistId, musicId);
        setSelectedMusicIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(musicId);
          return newSet;
        });
        toast.success("Música removida da setlist");
      } else {
        await api.addMusicToSetList(setlistId, musicId, 0);
        setSelectedMusicIds((prev) => {
          const newSet = new Set(prev);
          newSet.add(musicId);
          return newSet;
        });
        toast.success("Música adicionada à setlist");
      }
    } catch (error) {
      console.error("Erro ao atualizar setlist:", error);
      toast.error("Ocorreu um erro ao atualizar a setlist.");
    }
  };

  const handleBackToSetlist = () => {
    api.clearSetlistsCache();
    router.push(`/groups/${groupId}/setlist/${setlistId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" className="mr-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>

        <Skeleton className="h-10 w-full mb-6" />

        <div className="grid grid-cols-1 gap-4">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToSetlist}
            className="mr-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">
            Adicionar músicas à setlist: {setlist?.title}
          </h1>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar músicas por título, autor ou tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-4">
        {filteredMusic.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-gray-500">
              Nenhuma música encontrada.{" "}
              {searchQuery
                ? "Tente outra busca."
                : "Adicione músicas ao seu grupo primeiro."}
            </p>
          </Card>
        ) : (
          filteredMusic.map((music) => {
            const isSelected = selectedMusicIds.has(music.id);

            return (
              <Card
                key={music.id}
                className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                  isSelected ? "border-blue-400 bg-blue-50/50" : ""
                }`}
                onClick={() => handleMusicToggle(music.id, isSelected)}
              >
                <div className="flex items-center">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => {}}
                    className="mr-4"
                  />
                  <div className="flex items-center">
                    {music.thumbnail ? (
                      <Image
                        src={music.thumbnail}
                        alt={music.title}
                        className="w-10 h-10 object-cover rounded mr-4"
                        width={40}
                        height={40}
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center mr-4">
                        <MusicIcon className="w-5 h-5 text-gray-500" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-lg">{music.title}</h3>
                      <p className="text-sm text-gray-600">
                        {music.author} • {music.tone}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      <div className="mt-8 flex justify-end">
        <Button variant="default" onClick={handleBackToSetlist}>
          Concluído
        </Button>
      </div>
    </div>
  );
};

export default AddMusicPage;
