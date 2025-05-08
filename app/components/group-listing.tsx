import Link from "next/link";
import { Music, Plus, Users, Calendar, Loader2 } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useApi } from "@/app/hooks/use-api";
import { Group as TypeGroup } from "@/app/types/group";

export function GroupListing() {
  const [groups, setGroups] = useState<TypeGroup[] | []>([]);
  const [isLoading, setIsLoading] = useState(true);
  const api = useApi();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setIsLoading(true);
        const data = await api.getAllGroups();
        setGroups(data || []);
      } catch (error) {
        console.error("Erro ao carregar grupos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Seus Grupos de Louvor</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seus grupos de louvor, músicas e setlists
          </p>
        </div>
        <Button asChild className="bg-orange-500 hover:bg-orange-600">
          <Link href="/create-group">
            <Plus className="mr-2 h-4 w-4" />
            Criar Novo Grupo
          </Link>
        </Button>
      </div>

      {groups.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">
            Nenhum grupo encontrado
          </h2>
          <p className="text-muted-foreground mb-6">
            Você ainda não participa de nenhum grupo. Crie um novo grupo para
            começar!
          </p>
          <Button asChild className="bg-orange-500 hover:bg-orange-600">
            <Link href="/create-group">
              <Plus className="mr-2 h-4 w-4" />
              Criar Novo Grupo
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <Link
              key={group.id}
              href={`/groups/${group.id}`}
              className="block group"
            >
              <Card className="h-full transition-all duration-200 hover:shadow-md hover:border-orange-200 group-hover:border-orange-200">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 rounded-full overflow-hidden bg-orange-100 flex items-center justify-center border-2 border-orange-200">
                      <Image
                        src={group.imageUrl || "/placeholder-groups.png"}
                        alt={group.name}
                        fill
                        sizes="80px"
                        priority
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <CardTitle className="group-hover:text-orange-500 transition-colors">
                        {group.name}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        Criado em{" "}
                        {new Date(group.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <div className="flex flex-col items-center p-2 bg-muted rounded-md">
                      <Music className="h-4 w-4 text-orange-500 mb-1" />
                      <span className="text-sm font-medium">
                        {group.musics?.length || 0}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Músicas
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-muted rounded-md">
                      <Calendar className="h-4 w-4 text-orange-500 mb-1" />
                      <span className="text-sm font-medium">
                        {group.setlists?.length || 0}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Setlists
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-muted rounded-md">
                      <Users className="h-4 w-4 text-orange-500 mb-1" />
                      <span className="text-sm font-medium">
                        {group.permissions?.length || 0}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Membros
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <Button
                    variant="ghost"
                    className="w-full text-orange-500 group-hover:bg-orange-50"
                  >
                    Ver Grupo
                  </Button>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
