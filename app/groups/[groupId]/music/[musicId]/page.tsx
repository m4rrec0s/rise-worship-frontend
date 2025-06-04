"use client";

import { useParams, useRouter } from "next/navigation";
import { useApi } from "@/app/hooks/use-api";
import { useEffect, useState } from "react";
import { Music } from "@/app/types/music";
import { ChevronLeft, Edit, Music2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { LoadingIcon } from "@/app/components/loading-icon";
import { useAuth } from "@/app/context/auth-context";
import { Switch } from "@/app/components/ui/switch";
import { Label } from "@/app/components/ui/label";

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

const MusicPage = () => {
  const params = useParams();
  const musicId = params.musicId as string;
  const groupId = params.groupId as string;
  const { getMusicById, getGroupMembers } = useApi();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [music, setMusic] = useState<Music | null>(null);
  const [userPermission, setUserPermission] = useState<string | null>(null);
  const [showChords, setShowChords] = useState(false);
  const [parsedCipher, setParsedCipher] = useState<Cipher | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const musicData = await getMusicById(musicId);
        setMusic(musicData);
        if (musicData.cipher) {
          try {
            const cipherData = JSON.parse(musicData.cipher);

            if (Array.isArray(cipherData.segments)) {
              const convertedCipher: Cipher = {
                key: cipherData.key || "C",
                chordLines: cipherData.segments.map(
                  (segment: { chord: string; lineIndex: number }) => ({
                    id: Math.random().toString(36).substr(2, 9),
                    chords: segment.chord,
                    lyrics: "",
                    lyricsLineIndex: segment.lineIndex,
                  })
                ),
              };
              setParsedCipher(convertedCipher);
            } else if (Array.isArray(cipherData.chordLines)) {
              setParsedCipher(cipherData as Cipher);
            }
          } catch (error) {
            console.error("Erro ao parsear a cifra:", error);
          }
        }

        if (user && groupId) {
          const members = await getGroupMembers(groupId);
          const currentUser = members.find(
            (member: { user: { id: string }; permission: string }) =>
              member.user.id === user.id
          );
          if (currentUser) {
            setUserPermission(currentUser.permission);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [musicId, groupId, user]);

  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const renderLyricsWithChords = () => {
    if (!music || !music.lyrics) {
      return music?.lyrics || "";
    }

    const lines = music.lyrics.split("\n");
    const result: React.ReactNode[] = [];

    if (
      !parsedCipher ||
      !parsedCipher.chordLines ||
      parsedCipher.chordLines.length === 0
    ) {
      return (
        <div className="whitespace-pre-wrap">
          {lines.map((line, index) => (
            <div key={`line-${index}`} className="mb-2">
              {line.toLowerCase()}
            </div>
          ))}
        </div>
      );
    }

    const chordsByLine: { [lineIndex: number]: ChordLine[] } = {};

    parsedCipher.chordLines.forEach((chordLine) => {
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
        <div key={`line-${lineIndex}`} className="mb-2">
          {line.toLowerCase()}
        </div>
      );
    });

    return <div className="whitespace-pre-wrap">{result}</div>;
  };

  const canEditMusic = userPermission === "admin" || userPermission === "edit";

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[60vh]">
        <LoadingIcon />
      </div>
    );
  }
  return (
    <section className="">
      <div className="container mx-auto py-8 px-2 sm:px-4">
        <div className="flex justify-between max-sm:flex-col sm:items-center mb-6 gap-5">
          <Button
            variant={"link"}
            className="p-0 w-fit"
            onClick={handleBack}
            asChild
          >
            <div className="flex items-center hover:underline hover:cursor-pointer">
              <ChevronLeft className="text-orange-600 mr-2" size={32} />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-orange-600 dark:from-white dark:to-orange-400 bg-clip-text text-transparent">
                Detalhes da Música
              </h1>
            </div>
          </Button>
          {canEditMusic && music && (
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href={`/groups/${groupId}/music/${musicId}/edit-cipher`}>
                  <Music2 className="mr-2 h-4 w-4" />
                  Editar Cifra
                </Link>
              </Button>
              <Button asChild className="bg-orange-500 hover:bg-orange-600">
                <Link href={`/groups/${groupId}/music/${musicId}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar Música
                </Link>
              </Button>
            </div>
          )}
        </div>

        {music ? (
          <div className="bg-white dark:bg-slate-900 shadow-xl rounded-2xl overflow-hidden border border-orange-100 dark:border-orange-900/30">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/3 p-6 bg-gradient-to-b from-orange-50 dark:from-neutral-800 to-background flex flex-col items-center">
                <div className="flex justify-center">
                  <Image
                    src={music.thumbnail || "/placeholder-music.png"}
                    alt={music.title}
                    width={220}
                    height={220}
                    className="rounded-xl shadow-lg object-cover border border-orange-100 dark:border-orange-900/30"
                  />
                </div>
                <div className="mt-6 space-y-3 w-full">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-orange-600 dark:from-white dark:to-orange-400 bg-clip-text text-transparent">
                    {music.title}
                  </h2>
                  <div className="space-y-1">
                    <p className="text-slate-700 dark:text-slate-300 flex items-center text-base">
                      <span className="font-semibold mr-2">Autor:</span>
                      {music.author}
                    </p>
                    {music.tone && (
                      <p className="text-slate-700 dark:text-slate-300 flex items-center text-base">
                        <span className="font-semibold mr-2">Tom:</span>
                        {music.tone}
                      </p>
                    )}
                    {music.bpm && (
                      <p className="text-slate-700 dark:text-slate-300 flex items-center text-base">
                        <span className="font-semibold mr-2">BPM:</span>
                        {music.bpm}
                      </p>
                    )}
                    {music.group && (
                      <p className="text-slate-700 dark:text-slate-300 flex items-center text-base">
                        <span className="font-semibold mr-2">Grupo:</span>
                        {music.group.name}
                      </p>
                    )}
                  </div>
                  {music.links &&
                    typeof music.links === "object" &&
                    Object.keys(music.links).length > 0 && (
                      <div className="mt-4 pt-4 border-t border-orange-100 dark:border-orange-900/30">
                        <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">
                          Links
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {music.links.youtube && (
                            <Link
                              href={music.links.youtube}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1 bg-red-600 text-white rounded-full text-sm hover:bg-red-700 transition-colors shadow"
                            >
                              YouTube
                            </Link>
                          )}
                          {music.links.spotify && (
                            <Link
                              href={music.links.spotify}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1 bg-green-600 text-white rounded-full text-sm hover:bg-green-700 transition-colors shadow"
                            >
                              Spotify
                            </Link>
                          )}
                          {Array.isArray(music.links.others) &&
                            music.links.others.length > 0 &&
                            music.links.others.map((link, index) => (
                              <Link
                                key={index}
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700 transition-colors shadow"
                              >
                                Link {index + 1}
                              </Link>
                            ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>

              <div className="md:w-2/3 p-6 border-t md:border-t-0 md:border-l border-orange-100 dark:border-orange-900/30 flex flex-col bg-neutral-50 dark:bg-neutral-950">
                <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">
                  Letra
                </h3>
                <div className="bg-orange-50 dark:bg-neutral-900 p-4 rounded-lg shadow-inner whitespace-pre-wrap font-medium text-slate-800 dark:text-slate-200 min-h-[180px] text-base leading-relaxed">
                  {showChords ? renderLyricsWithChords() : music.lyrics}
                </div>
                <div className="mt-4 flex items-center">
                  <Switch
                    id="show-chords"
                    checked={showChords}
                    onCheckedChange={setShowChords}
                  />
                  <Label
                    htmlFor="show-chords"
                    className="ml-2 text-slate-700 dark:text-slate-300"
                  >
                    Mostrar acordes
                  </Label>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 shadow-md rounded-2xl p-6 text-center border border-orange-100 dark:border-orange-900/30">
            <p className="text-slate-600 dark:text-slate-300 text-lg">
              Música não encontrada.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default MusicPage;
