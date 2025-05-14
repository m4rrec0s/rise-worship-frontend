import InfiniteScroll from "react-infinite-scroll-component";
import { ChevronRight, Plus, Search } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import Link from "next/link";
import { Music } from "@/app/types/music";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { LoadingIcon } from "../loading-icon";
import { useState } from "react";
import { SetlistMusic } from "@/app/types/setlistMusic";
import MusicItem from "./music-item";

interface MusicListProps {
  musics: Music[] | SetlistMusic[];
  isLoading: boolean;
  loadMore: () => void;
  hasMore: boolean;
  groupId: string;
  searchQuery: string;
  clearSearch: () => void;
  setSearchQuery: (query: string) => void;
  permission: string;
}

const MusicList = ({
  clearSearch,
  groupId,
  isLoading,
  musics,
  searchQuery,
  setSearchQuery,
  loadMore,
  hasMore,
  permission,
}: MusicListProps) => {
  const [inputValue, setInputValue] = useState(searchQuery);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setSearchQuery(inputValue.trim());
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleClearSearch = () => {
    setInputValue("");
    clearSearch();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <LoadingIcon size={30} />
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6 gap-2">
        <form
          onSubmit={handleSearchSubmit}
          className="relative w-full max-w-md"
        >
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar músicas..."
            className="pl-10 "
            value={inputValue}
            onChange={handleInputChange}
          />
          {inputValue && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
              onClick={handleClearSearch}
              type="button"
            >
              <span className="sr-only">Limpar</span>
              <span className="text-lg">×</span>
            </Button>
          )}
        </form>

        {permission === "admin" ||
          (permission === "edit" && (
            <Button asChild className="bg-orange-500 hover:bg-orange-600">
              <Link href={`/groups/${groupId}/create-music`}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Música
              </Link>
            </Button>
          ))}
      </div>
      {musics.length === 0 ? (
        <Card className="bg-muted/40">
          <CardContent className="py-8 text-center">
            {isLoading && <LoadingIcon />}
            <h3 className="text-lg font-medium mb-2">
              {!isLoading && searchQuery
                ? "Nenhum resultado encontrado"
                : "Nenhuma música encontrada"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {!isLoading && searchQuery
                ? `Não foi encontrada nenhuma música com "${searchQuery}".`
                : "Comece adicionando músicas ao seu grupo de louvor."}
            </p>
            {!isLoading && searchQuery ? (
              <Button variant="outline" onClick={handleClearSearch}>
                Limpar Busca
              </Button>
            ) : (
              <Button asChild className="bg-orange-500 hover:bg-orange-600">
                <Link href={`/groups/${groupId}/create-music`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Primeira Música
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <InfiniteScroll
          dataLength={musics.length}
          next={loadMore}
          hasMore={hasMore}
          scrollableTarget="scrollableMain"
          loader={
            <div className="w-full flex justify-center py-4">
              <LoadingIcon size={30} />
            </div>
          }
          endMessage={
            <p className="w-full text-center text-gray-500 text-sm py-4">
              Não há mais músicas para carregar.
            </p>
          }
        >
          <div className="grid gap-4">
            {" "}
            {musics.map((song) => (
              <MusicItem key={song.id} groupId={groupId} item={song} />
            ))}
          </div>
        </InfiniteScroll>
      )}
    </>
  );
};

export default MusicList;
