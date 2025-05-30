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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Label } from "@/app/components/ui/label";
import { LoadingIcon } from "@/app/components/loading-icon";
import { ChevronLeft, Loader2, Save, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { transpose, keys } from "@hrgui/chord-charts";
import { Input } from "@/app/components/ui/input";

interface ChordLine {
  id: string;
  chords: string;
  lyrics: string;
  lyricsLineIndex: number;
}

interface Cipher {
  key: string;
  chordLines: ChordLine[];
}

const chordRegex =
  /\b([A-G][#b]?(?:m|maj|min|aug|dim|sus|add|maj7|m7|7|9|11|13)?(?:\d+)?(?:\/[A-G][#b]?)?)\b/g;

function KeysSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
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

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export default function CipherEditPage() {
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

  const [originalKey, setOriginalKey] = useState("C");
  const [currentKey, setCurrentKey] = useState("C");
  const [chordLines, setChordLines] = useState<ChordLine[]>([]);
  const [lyricsLines, setLyricsLines] = useState<string[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const musicData = await api.getMusicById(musicId);
        setMusic(musicData);

        const lyrics = musicData.lyrics || "";
        const linesArray = lyrics.split("\n");
        setLyricsLines(linesArray);
        if (musicData.cipher) {
          try {
            const cipherData = JSON.parse(musicData.cipher);

            if (cipherData.key) {
              setOriginalKey(cipherData.key);
              setCurrentKey(cipherData.key);
            }
            if (Array.isArray(cipherData.segments)) {
              toast.message("Detectado formato antigo de cifra, convertendo...");
              const convertedChordLines: ChordLine[] = cipherData.segments.map(
                (
                  segment: { chord: string; lineIndex: number },
                  index: number
                ) => ({
                  id: generateId(),
                  chords: segment.chord,
                  lyrics: "",
                  lyricsLineIndex: segment.lineIndex,
                })
              );
              setChordLines(convertedChordLines);
            } else if (Array.isArray(cipherData.chordLines)) {
              toast.message("Carregando cifra no formato novo");
              setChordLines(cipherData.chordLines);
            }
          } catch (e) {
            console.error("Erro ao parsear cifra:", e);
          }
        }

        if (musicData.tone && !musicData.cipher) {
          setOriginalKey(musicData.tone);
          setCurrentKey(musicData.tone);
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
              currentUser.permission !== "editor"
            ) {
              toast.error("Você não tem permissão para editar esta cifra");
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
  const handleKeyChange = (newKey: string) => {
    if (newKey === currentKey) return;

    const oldKey = currentKey;
    setCurrentKey(newKey);

    const transposedChordLines = chordLines.map((chordLine) => ({
      ...chordLine,
      chords: chordLine.chords.replace(chordRegex, (match) => {
        try {
          return transpose(match, oldKey, newKey);
        } catch (error) {
          console.error("Erro ao transpor acorde:", match, error);
          return match;
        }
      }),
    }));

    setChordLines(transposedChordLines);
  };
  const addChordLine = () => {
    const newChordLine: ChordLine = {
      id: generateId(),
      chords: "",
      lyrics: "",
      lyricsLineIndex: 0,
    };
    const updatedChordLines = [...chordLines, newChordLine];
    setChordLines(updatedChordLines);
  };

  const removeChordLine = (id: string) => {
    setChordLines(chordLines.filter((line) => line.id !== id));
  };
  const updateChordLine = (
    id: string,
    field: keyof ChordLine,
    value: string | number
  ) => {
    const updatedChordLines = chordLines.map((line) =>
      line.id === id ? { ...line, [field]: value } : line
    );
    setChordLines(updatedChordLines);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSaving(true);

      const cipherData: Cipher = {
        key: currentKey,
        chordLines: chordLines,
      };

      const musicData = new FormData();
      musicData.append("cipher", JSON.stringify(cipherData));
      musicData.append("tone", currentKey);

      await api.updateMusic(musicId, musicData);

      toast.success("Cifra atualizada com sucesso!");
      router.push(`/groups/${groupId}/music/${musicId}`);
    } catch (error) {
      toast.error(
        "Erro ao atualizar cifra. " +
          ((error as AxiosError<{ error: string }>)?.response?.data?.error ||
            "Tente novamente mais tarde.")
      );
      console.error("Erro ao atualizar cifra:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const renderFullCipherPreview = () => {
    if (!music || !music.lyrics) {
      return (
        <div className="text-gray-500">Letra da música não encontrada.</div>
      );
    }

    const lines = music.lyrics.split("\n");
    const result: React.ReactNode[] = [];

    if (chordLines.length === 0) {
      return (
        <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-200">
          {lines.map((line, index) => (
            <div key={`line-${index}`} className="mb-2">
              {line.toLowerCase()}
            </div>
          ))}
        </div>
      );
    }

    const chordsByLine: { [lineIndex: number]: ChordLine[] } = {};

    chordLines.forEach((chordLine) => {
      if (!chordsByLine[chordLine.lyricsLineIndex]) {
        chordsByLine[chordLine.lyricsLineIndex] = [];
      }
      chordsByLine[chordLine.lyricsLineIndex].push(chordLine);
    });

    lines.forEach((line, lineIndex) => {
      if (chordsByLine[lineIndex]) {
        chordsByLine[lineIndex].forEach((chordLine, chordIndex) => {
          result.push(
            <div
              key={`chord-${lineIndex}-${chordIndex}`}
              className="text-orange-500 font-mono font-medium text-sm mb-1 whitespace-pre"
            >
              {chordLine.chords}
            </div>
          );
        });
      }

      result.push(
        <div
          key={`line-${lineIndex}`}
          className="mb-2 text-gray-700 dark:text-gray-200"
        >
          {line.toLowerCase()}
        </div>
      );
    });

    return <div className="whitespace-pre-wrap">{result}</div>;
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
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Editar Cifra</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {" "}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Editar Cifra: {music?.title}</CardTitle>
              <CardDescription>
                Configure o tom e adicione acordes às linhas da música
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="tonalidade">Tom da Cifra</Label>
                <div className="w-full sm:w-2/3">
                  <KeysSelect value={currentKey} onChange={handleKeyChange} />
                </div>
                <p className="text-xs text-muted-foreground">
                  Mudar o tom transporá todos os acordes automaticamente
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Campos de Cifra ({chordLines.length})</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addChordLine}
                    className="text-orange-600 border-orange-600 hover:bg-orange-50"
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Adicionar
                  </Button>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {chordLines.map((chordLine, index) => (
                    <div
                      key={chordLine.id}
                      className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-900"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-500 min-w-[20px]">
                              #{index + 1}
                            </span>
                            <Input
                              value={chordLine.chords}
                              onChange={(e) =>
                                updateChordLine(
                                  chordLine.id,
                                  "chords",
                                  e.target.value
                                )
                              }
                              placeholder="Ex: C Am F G"
                              className="font-mono text-sm h-8"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 min-w-[20px]">
                              L:
                            </span>
                            <Select
                              value={chordLine.lyricsLineIndex.toString()}
                              onValueChange={(value) =>
                                updateChordLine(
                                  chordLine.id,
                                  "lyricsLineIndex",
                                  parseInt(value)
                                )
                              }
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Linha..." />
                              </SelectTrigger>
                              <SelectContent className="max-h-40">
                                {lyricsLines.map((line, lineIndex) => (
                                  <SelectItem
                                    key={lineIndex}
                                    value={lineIndex.toString()}
                                  >
                                    {lineIndex + 1}: {line.substring(0, 25)}
                                    {line.length > 25 ? "..." : ""}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeChordLine(chordLine.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {chordLines.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm">Nenhum campo de cifra criado</p>
                      <p className="text-xs">
                        Clique em &quot;Adicionar&quot; para começar
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preview em Tempo Real</CardTitle>
              <CardDescription>
                Veja como a cifra aparecerá na página da música
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-white dark:bg-black border rounded-lg p-4 max-h-96 overflow-y-auto">
                {renderFullCipherPreview()}
              </div>
            </CardContent>
          </Card>
        </div>{" "}
        <div className="flex justify-end gap-3 pt-4">
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
                Salvar Cifra
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
