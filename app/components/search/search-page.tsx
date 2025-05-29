"use client";

import { useEffect, useState } from "react";
import { Group } from "@/app/types/group";
import { useApi } from "@/app/hooks/use-api";
import InfiniteScroll from "react-infinite-scroll-component";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { LoadingIcon } from "@/app/components/loading-icon";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import { toast } from "sonner";

interface SearchPageProps {
  searchQuery: string;
  onClearSearch: () => void;
}

interface GroupCardProps {
  group: Group;
}

interface CheckMembershipResponse {
  isMember: boolean;
}

const GroupCard = ({ group }: GroupCardProps) => {
  const api = useApi();
  const [isMember, setIsMember] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [joining, setJoining] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkMembership = async () => {
      try {
        const response: CheckMembershipResponse = await api.checkUserMembership(
          group.id
        );
        setIsMember(response.isMember);
      } catch (error) {
        console.error("Error checking membership:", error);
      }
    };
    if (group.id) {
      checkMembership();
    }
  }, [group.id]);

  const handleClick = () => {
    if (isMember) {
      router.push(`/groups/${group.id}`);
    } else {
      setDrawerOpen(true);
    }
  };

  const handleJoinGroup = async () => {
    setJoining(true);
    try {
      await api.joinGroup(group.id);
      setIsMember(true);
      setDrawerOpen(false);
      router.push(`/groups/${group.id}`);
      toast.success("Você entrou no grupo com sucesso!");
    } catch (error) {
      console.error("Error joining group:", error);
      toast.error(
        "Ocorreu um erro ao entrar no grupo. Tente novamente mais tarde."
      );
    } finally {
      setJoining(false);
    }
  };

  return (
    <>
      <Card className="overflow-hidden w-full px-0 py-0">
        <Button
          className="h-full w-full flex items-center justify-start gap-2 px-5 py-3"
          variant="ghost"
          onClick={handleClick}
        >
          <div className="rounded-full relative w-20 h-20 p-1 border-2 border-orange-200">
            <Image
              src={group.imageUrl || "/placeholder-groups.png"}
              alt={group.name}
              fill
              className="object-cover rounded-full"
            />
          </div>
          <CardHeader className="p-4">
            <CardTitle>{group.name}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground truncate">
              {group.description}
            </CardDescription>
          </CardHeader>
        </Button>
      </Card>
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="pb-6">
          <DrawerHeader className="flex flex-row items-center gap-4">
            <div className="rounded-full relative w-16 h-16">
              <Image
                src={group.imageUrl || "/placeholder-groups.png"}
                alt={group.name}
                fill
                className="object-cover rounded-full"
              />
            </div>
            <div>
              <DrawerTitle>{group.name}</DrawerTitle>
              <DrawerDescription>{group.description}</DrawerDescription>
            </div>
          </DrawerHeader>
          <DrawerFooter className="flex flex-col gap-4">
            <Button onClick={handleJoinGroup} disabled={joining}>
              {joining ? "Entrando..." : "Entrar no grupo"}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export function SearchPage({ searchQuery, onClearSearch }: SearchPageProps) {
  const api = useApi();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const perPage = 15;

  useEffect(() => {
    setGroups([]);
    setPage(1);
    setHasMore(true);

    if (searchQuery.trim()) {
      loadGroups(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

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

  const featuredGroups = groups.slice(0, 3);
  const otherGroups = groups.slice(3);

  return (
    <div className="container mx-auto py-8 px-5">
      <div className="flex items-center mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClearSearch}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Voltar</span>
        </Button>
        <h1 className="text-2xl font-bold">
          Resultados para:{" "}
          <span className="text-orange-500">&ldquo;{searchQuery}&rdquo;</span>
        </h1>
      </div>

      <div className="space-y-8">
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
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  Principais resultados
                </h2>
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {featuredGroups.map((group) => (
                    <GroupCard key={group.id} group={group} />
                  ))}
                </div>
              </div>
            )}

            {otherGroups.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  Outros resultados
                </h2>
                <InfiniteScroll
                  dataLength={otherGroups.length}
                  next={loadMore}
                  hasMore={hasMore}
                  loader={
                    <div className="flex justify-center py-4">
                      <LoadingIcon size={30} />
                    </div>
                  }
                  endMessage={
                    <p className="text-center text-sm text-muted-foreground py-4">
                      Não há mais resultados para mostrar
                    </p>
                  }
                >
                  <div className="grid gap-4 grid-cols-1">
                    {otherGroups.map((group) => (
                      <GroupCard key={group.id} group={group} />
                    ))}
                  </div>
                </InfiniteScroll>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default SearchPage;
