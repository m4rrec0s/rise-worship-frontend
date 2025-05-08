"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Music, Plus, List, Users, Loader2 } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/components/ui/avatar";
import Image from "next/image";
import { useApi } from "@/app/hooks/use-api";
import { Group } from "@/app/types/group";
import { Music as MusicType } from "@/app/types/music";
import { Setlist } from "@/app/types/setlist";
import { User } from "@/app/types/user";

interface MemberData {
  id: string;
  permission: string;
  user: User;
}

export default function GroupPage() {
  const params = useParams();
  // const router = useRouter();
  const api = useApi();
  const groupId = params.groupId as string;

  const [activeTab, setActiveTab] = useState("songs");
  const [isLoading, setIsLoading] = useState(true);
  const [group, setGroup] = useState<Group | null>(null);
  const [musics, setMusics] = useState<MusicType[]>([]);
  const [setlists, setSetlists] = useState<Setlist[]>([]);
  const [members, setMembers] = useState<User[]>([]);

  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        setIsLoading(true);

        // Buscar dados do grupo
        const groupData = await api.getGroupById(groupId);
        setGroup(groupData);

        // Buscar músicas do grupo
        const musicsData = await api.getAllMusicsByGroup(groupId);
        setMusics(musicsData);

        // Buscar setlists do grupo
        const setlistsData = await api.getSetListsByGroup(groupId);
        setSetlists(setlistsData);

        // Buscar membros do grupo e extrair os dados do usuário
        const membersData = await api.getGroupMembers(groupId);
        // A API retorna um array de permissões com o usuário aninhado, então extraímos os objetos de usuário
        const extractedUsers = membersData.map(
          (member: MemberData) => member.user
        );
        setMembers(extractedUsers);
      } catch (error) {
        console.error("Erro ao carregar dados do grupo:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroupData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold">Grupo não encontrado</h1>
        <Button variant="link" asChild className="p-0 mt-2">
          <Link href="/">Voltar para a lista de grupos</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="h-16 w-16 rounded-full overflow-hidden bg-orange-100 flex items-center justify-center">
          <Image
            src={group.imageUrl || "/placeholder-groups.png"}
            alt={group.name}
            width={64}
            height={64}
            className="h-full w-full object-cover"
          />
        </div>
        <h1 className="text-3xl font-bold">{group.name}</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="songs" className="flex items-center gap-2">
            <Music className="h-4 w-4" />
            Músicas
          </TabsTrigger>
          <TabsTrigger value="setlists" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Setlists
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Membros
          </TabsTrigger>
        </TabsList>

        <TabsContent value="songs">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Músicas</h2>
            <Button asChild className="bg-orange-500 hover:bg-orange-600">
              <Link href={`/groups/${groupId}/create-music`}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Música
              </Link>
            </Button>
          </div>
          {musics.length === 0 ? (
            <Card className="bg-muted/40">
              <CardContent className="py-8 text-center">
                <h3 className="text-lg font-medium mb-2">
                  Nenhuma música encontrada
                </h3>
                <p className="text-muted-foreground mb-4">
                  Comece adicionando músicas ao seu grupo de louvor.
                </p>
                <Button asChild className="bg-orange-500 hover:bg-orange-600">
                  <Link href={`/groups/${groupId}/create-music`}>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Primeira Música
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {musics.slice(0, 5).map((song) => (
                <Card
                  key={song.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader className="py-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-lg">{song.title}</CardTitle>
                        <CardDescription>{song.author}</CardDescription>
                      </div>
                      <div className="bg-orange-100 text-orange-800 px-2 py-1 rounded-md text-sm font-medium">
                        Tom: {song.tone}
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
          {musics.length > 5 && (
            <div className="mt-4 text-center">
              <Button variant="outline" asChild>
                <Link href={`/groups/${groupId}/musics`}>
                  Ver Todas as Músicas
                </Link>
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="setlists">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Setlists</h2>
            <Button asChild className="bg-orange-500 hover:bg-orange-600">
              <Link href={`/groups/${groupId}/create-setlist`}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Setlist
              </Link>
            </Button>
          </div>
          {setlists.length === 0 ? (
            <Card className="bg-muted/40">
              <CardContent className="py-8 text-center">
                <h3 className="text-lg font-medium mb-2">
                  Nenhuma setlist encontrada
                </h3>
                <p className="text-muted-foreground mb-4">
                  Comece criando uma setlist para seu próximo culto.
                </p>
                <Button asChild className="bg-orange-500 hover:bg-orange-600">
                  <Link href={`/groups/${groupId}/create-setlist`}>
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Primeira Setlist
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {setlists.slice(0, 3).map((setlist) => (
                <Card
                  key={setlist.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader className="py-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-lg">
                          {setlist.title}
                        </CardTitle>
                        <CardDescription>
                          {new Date(setlist.createdAt).toLocaleDateString(
                            "pt-BR"
                          )}
                        </CardDescription>
                      </div>
                      <div className="bg-orange-100 text-orange-800 px-2 py-1 rounded-md text-sm font-medium">
                        {setlist.musics?.length || 0} músicas
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
          {setlists.length > 3 && (
            <div className="mt-4 text-center">
              <Button variant="outline" asChild>
                <Link href={`/groups/${groupId}/setlists`}>
                  Ver Todas as Setlists
                </Link>
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="members">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Membros</h2>
            <Button asChild className="bg-orange-500 hover:bg-orange-600">
              <Link href={`/groups/${groupId}/invite`}>
                <Plus className="mr-2 h-4 w-4" />
                Convidar Membro
              </Link>
            </Button>
          </div>
          {members.length === 0 ? (
            <Card className="bg-muted/40">
              <CardContent className="py-8 text-center">
                <h3 className="text-lg font-medium mb-2">
                  Nenhum membro encontrado
                </h3>
                <p className="text-muted-foreground mb-4">
                  Convide membros para participar do seu grupo de louvor.
                </p>
                <Button asChild className="bg-orange-500 hover:bg-orange-600">
                  <Link href={`/groups/${groupId}/invite`}>
                    <Plus className="mr-2 h-4 w-4" />
                    Convidar Membros
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {members.map((member) => (
                <Card
                  key={member.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="py-4 flex items-center gap-4">
                    <Avatar>
                      <AvatarImage
                        src={member.imageUrl || "/placeholder-user.png"}
                        alt={member.name}
                      />
                      <AvatarFallback>
                        {member.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{member.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {member.email}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
