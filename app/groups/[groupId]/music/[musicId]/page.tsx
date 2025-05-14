"use client";

import { useParams, useRouter } from "next/navigation";
import { useApi } from "@/app/hooks/use-api";
import { useEffect, useState } from "react";
import { Music } from "@/app/types/music";
import { ChevronLeft, Edit } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { LoadingIcon } from "@/app/components/loading-icon";
import { useAuth } from "@/app/context/auth-context";

const MusicPage = () => {
  const params = useParams();
  const router = useRouter();
  const musicId = params.musicId as string;
  const groupId = params.groupId as string;
  const { getMusicById, getGroupMembers } = useApi();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [music, setMusic] = useState<Music | null>(null);
  const [userPermission, setUserPermission] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const musicData = await getMusicById(musicId);
        setMusic(musicData);

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

  const canEditMusic = userPermission === "admin" || userPermission === "edit";

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[60vh]">
        <LoadingIcon />
      </div>
    );
  }
  return (
    <section className="bg-gray-100 dark:bg-neutral-950">
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <Button
            variant={"link"}
            onClick={() => router.back()}
            className="p-0"
          >
            <div className="text-orange-600 flex items-center hover:underline hover:cursor-pointer">
              <ChevronLeft className="text-orange-600 mr-2" size={36} />
              <h1 className="text-3xl font-bold">Detalhes da Música</h1>
            </div>
          </Button>

          {canEditMusic && music && (
            <Button asChild className="bg-orange-500 hover:bg-orange-600">
              <Link href={`/groups/${groupId}/music/${musicId}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Editar Música
              </Link>
            </Button>
          )}
        </div>

        {music ? (
          <div className="bg-white dark:bg-black shadow-md rounded-lg overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/3 p-6 bg-gradient-to-b from-orange-50 dark:from-neutral-800 to-background">
                <div className="flex justify-center">
                  <Image
                    src={music.thumbnail || "/placeholder-music.png"}
                    alt={music.title}
                    width={250}
                    height={250}
                    className="rounded-lg shadow-md object-cover"
                  />
                </div>
                <div className="mt-6 space-y-3">
                  <h2 className="text-2xl font-bold text-orange-600">
                    {music.title}
                  </h2>
                  <div className="space-y-1">
                    <p className="text-gray-700 dark:text-gray-300 flex items-center">
                      <span className="font-semibold mr-2">Autor:</span>
                      {music.author}
                    </p>
                    {music.tone && (
                      <p className="text-gray-700 dark:text-gray-300 flex items-center">
                        <span className="font-semibold mr-2">Tom:</span>
                        {music.tone}
                      </p>
                    )}
                    {music.bpm && (
                      <p className="text-gray-700 dark:text-gray-300 flex items-center">
                        <span className="font-semibold mr-2">BPM:</span>
                        {music.bpm}
                      </p>
                    )}
                    {music.group && (
                      <p className="text-gray-700 dark:text-gray-300 flex items-center">
                        <span className="font-semibold mr-2">Grupo:</span>
                        {music.group.name}
                      </p>
                    )}
                  </div>
                  {/* Links externos se houver */}
                  {music.links &&
                    typeof music.links === "object" &&
                    Object.keys(music.links).length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold mb-2">Links</h3>
                        <div className="flex flex-wrap gap-2">
                          {music.links.youtube && (
                            <Link
                              href={music.links.youtube}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1 bg-red-600 text-white rounded-full text-sm hover:bg-red-700 transition-colors"
                            >
                              YouTube
                            </Link>
                          )}
                          {music.links.spotify && (
                            <Link
                              href={music.links.spotify}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1 bg-green-600 text-white rounded-full text-sm hover:bg-green-700 transition-colors"
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
                                className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700 transition-colors"
                              >
                                Link {index + 1}
                              </Link>
                            ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>

              {/* Coluna da letra */}
              <div className="md:w-2/3 p-6 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                  Letra
                </h3>
                <div className="bg-gray-50 dark:bg-neutral-900 p-4 rounded-lg shadow-inner whitespace-pre-wrap font-medium text-gray-700 dark:text-gray-200 ">
                  {music.lyrics}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg p-6 text-center">
            <p className="text-gray-600 text-lg">Música não encontrada.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default MusicPage;
