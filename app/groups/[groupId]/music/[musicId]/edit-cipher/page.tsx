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
import { ChevronLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { AxiosError } from "axios";
import Editor from "react-simple-code-editor";
import { transpose, keys } from "@hrgui/chord-charts";

interface ChordSegment {
  chord: string;
  lineIndex: number;
  charOffset: number;
}

interface Cipher {
  key: string;
  segments: ChordSegment[];
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

function extractChords(text: string): ChordSegment[] {
  const lines = text.split("\n");
  const segments: ChordSegment[] = [];

  lines.forEach((line, lineIndex) => {
    let match;
    chordRegex.lastIndex = 0;

    while ((match = chordRegex.exec(line)) !== null) {
      segments.push({
        chord: match[0],
        lineIndex,
        charOffset: match.index,
      });
    }
  });

  return segments;
}

function reconstructCipherText(
  lyrics: string,
  segments: ChordSegment[],
  originalKey: string,
  currentKey: string
): string {
  const lines = lyrics.split("\n");

  const chordLines: string[] = Array(lines.length).fill("");

  segments.forEach((segment) => {
    const transposedChord =
      originalKey !== currentKey
        ? transpose(segment.chord, originalKey, currentKey)
        : segment.chord;

    while (chordLines.length <= segment.lineIndex) {
      chordLines.push("");
    }

    while (chordLines[segment.lineIndex].length < segment.charOffset) {
      chordLines[segment.lineIndex] += " ";
    }

    chordLines[segment.lineIndex] =
      chordLines[segment.lineIndex].substring(0, segment.charOffset) +
      transposedChord +
      chordLines[segment.lineIndex].substring(
        segment.charOffset + transposedChord.length
      );
  });

  const combined: string[] = [];
  for (let i = 0; i < Math.max(chordLines.length, lines.length); i++) {
    if (chordLines[i] && chordLines[i].trim()) {
      combined.push(chordLines[i]);
    }
    if (lines[i] !== undefined) {
      combined.push(lines[i]);
    }
  }

  return combined.join("\n");
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

  const [lyrics, setLyrics] = useState("");
  const [originalKey, setOriginalKey] = useState("C");
  const [currentKey, setCurrentKey] = useState("C");
  const [cipherText, setCipherText] = useState("");
  const [segments, setSegments] = useState<ChordSegment[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const musicData = await api.getMusicById(musicId);
        setMusic(musicData);
        setLyrics(musicData.lyrics || "");

        if (musicData.cipher) {
          try {
            const cipherData = JSON.parse(musicData.cipher) as Cipher;

            if (cipherData.key) {
              setOriginalKey(cipherData.key);
              setCurrentKey(cipherData.key);
            }

            if (
              Array.isArray(cipherData.segments) &&
              cipherData.segments.length > 0
            ) {
              setSegments(cipherData.segments);
              const text = reconstructCipherText(
                musicData.lyrics || "",
                cipherData.segments,
                cipherData.key,
                cipherData.key
              );
              setCipherText(text);
            } else {
              setCipherText(musicData.lyrics || "");
            }
          } catch (e) {
            setCipherText(musicData.lyrics || "");
            const extractedSegments = extractChords(musicData.cipher);
            if (extractedSegments.length > 0) {
              setSegments(extractedSegments);
            }
          }
        } else {
          setCipherText(musicData.lyrics || "");
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

    setCurrentKey(newKey);

    if (segments.length > 0) {
      const text = reconstructCipherText(lyrics, segments, originalKey, newKey);
      setCipherText(text);
    }
  };

  const handleCipherChange = (value: string) => {
    setCipherText(value);
    const newSegments = extractChords(value);
    setSegments(newSegments);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSaving(true);

      const cipherData: Cipher = {
        key: currentKey,
        segments: segments,
      };

      const musicData = new FormData();
      musicData.append("cipher", JSON.stringify(cipherData));

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

  const highlightWithLineNumbers = (code: string) => {
    return code.replace(
      chordRegex,
      (match) =>
        `<span style="color: #f97316; font-weight: bold;">${match}</span>`
    );
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
        <h1 className="text-2xl font-bold">Editar Cifra</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Cifra da Música: {music?.title}</CardTitle>
            <CardDescription>
              Adicione ou edite a cifra da música. Os acordes serão
              automaticamente detectados e destacados.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="tonalidade">Tom da Cifra</Label>
              <div className="w-full sm:w-1/3">
                <KeysSelect value={currentKey} onChange={handleKeyChange} />
              </div>
              <p className="text-xs text-muted-foreground">
                Mudar o tom transporá todos os acordes da cifra.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cipher">Editor de Cifra</Label>
              <div className="border rounded-md">
                <Editor
                  value={cipherText}
                  onValueChange={handleCipherChange}
                  highlight={(code) => highlightWithLineNumbers(code)}
                  padding={16}
                  style={{
                    fontFamily: "monospace",
                    fontSize: "14px",
                    minHeight: "400px",
                  }}
                  className="w-full"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Digite a cifra usando a notação padrão (Ex: C, Am, G/B). Os
                acordes serão detectados automaticamente.
              </p>
            </div>
          </CardContent>
        </Card>

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
                Salvar Cifra
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
