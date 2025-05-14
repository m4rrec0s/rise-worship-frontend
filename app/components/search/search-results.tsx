"use client";

import { useEffect, useState } from "react";
import { Group } from "@/app/types/group";
import { useApi } from "@/app/hooks/use-api";
import InfiniteScroll from "react-infinite-scroll-component";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { LoadingIcon } from "@/app/components/loading-icon";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";

interface SearchResultsProps {
  searchQuery: string;
  isOpen: boolean;
  onClose: () => void;
}

export const SearchResults = ({
  searchQuery,
  isOpen,
  onClose,
}: SearchResultsProps) => {
  const api = useApi();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const perPage = 15;
  useEffect(() => {
    // Reset state when search query changes
    setGroups([]);
    setPage(1);
    setHasMore(true);

    if (searchQuery.trim() && isOpen) {
      loadGroups(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, isOpen]);

  const loadGroups = async (pageToLoad: number) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const response = await api.getAllGroups(pageToLoad, perPage, searchQuery);

      const newGroups = response.data;

      if (pageToLoad === 1) {
        setGroups(newGroups);
      } else {
        setGroups((prevGroups) => [...prevGroups, ...newGroups]);
      }

      setHasMore(newGroups.length === perPage);
      setPage(pageToLoad);
    } catch (error) {
      console.error("Erro ao buscar grupos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = () => {
    if (!isLoading && hasMore) {
      loadGroups(page + 1);
    }
  };

  if (!isOpen) return null;

  const featuredGroups = groups.slice(0, 3);
  const otherGroups = groups.slice(3);

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div
        className="fixed inset-x-0 top-16 z-50 mx-auto max-w-3xl p-4 max-h-[calc(100vh-4rem)] overflow-y-auto"
        id="searchResults"
      >
        <div className="bg-background rounded-lg border shadow-lg">
          <div className="flex justify-between items-center p-4 border-b">
            {" "}
            <h2 className="text-xl font-semibold">
              Resultados para:{" "}
              <span className="text-orange-500">
                &ldquo;{searchQuery}&rdquo;
              </span>
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
              <span className="sr-only">Fechar</span>
            </Button>
          </div>

          <div className="p-4">
            {isLoading && groups.length === 0 ? (
              <div className="flex justify-center py-8">
                <LoadingIcon size={40} />
              </div>
            ) : groups.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-lg text-muted-foreground mb-2">
                  Nenhum resultado encontrado.
                </p>
                <p className="text-sm text-muted-foreground">
                  Tente outra busca com diferentes palavras-chave.
                </p>
              </div>
            ) : (
              <>
                {featuredGroups.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3">
                      Principais resultados
                    </h3>
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                      {featuredGroups.map((group) => (
                        <Card key={group.id} className="overflow-hidden">
                          <Link href={`/groups/${group.id}`} onClick={onClose}>
                            <div className="aspect-video relative">
                              <Image
                                src={
                                  group.imageUrl || "/placeholder-groups.png"
                                }
                                alt={group.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 300px"
                              />
                            </div>
                            <CardHeader className="p-3">
                              <CardTitle className="text-base">
                                {group.name}
                              </CardTitle>
                              <CardDescription className="line-clamp-1">
                                {group.description}
                              </CardDescription>
                            </CardHeader>
                          </Link>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {otherGroups.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-3">
                      Outros resultados
                    </h3>
                    <div className="overflow-y-auto" id="otherResults">
                      <InfiniteScroll
                        dataLength={otherGroups.length}
                        next={loadMore}
                        hasMore={hasMore}
                        loader={
                          <div className="flex justify-center py-4">
                            <LoadingIcon size={24} />
                          </div>
                        }
                        endMessage={
                          <p className="text-center text-sm text-muted-foreground py-2">
                            Não há mais resultados para mostrar
                          </p>
                        }
                        scrollableTarget="searchResults"
                      >
                        <div className="grid gap-3 grid-cols-1">
                          {otherGroups.map((group) => (
                            <Card key={group.id} className="overflow-hidden">
                              <Link
                                href={`/groups/${group.id}`}
                                onClick={onClose}
                              >
                                <div className="flex items-center p-3">
                                  <div className="h-12 w-12 relative mr-3 shrink-0">
                                    <Image
                                      src={
                                        group.imageUrl ||
                                        "/placeholder-groups.png"
                                      }
                                      alt={group.name}
                                      fill
                                      className="object-cover rounded"
                                      sizes="48px"
                                    />
                                  </div>
                                  <div>
                                    <h4 className="font-medium">
                                      {group.name}
                                    </h4>
                                    <p className="text-sm text-muted-foreground line-clamp-1">
                                      {group.description}
                                    </p>
                                  </div>
                                </div>
                              </Link>
                            </Card>
                          ))}
                        </div>
                      </InfiniteScroll>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
