import Image from "next/image";
import { Button } from "../ui/button";
import Link from "next/link";
import {
  ChevronRight,
  ChevronUp,
  Music as MusicIcon,
  Plus,
} from "lucide-react";
import { Setlist } from "@/app/types/setlist";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

interface SetlistProps {
  groupId: string;
  setlists: Setlist[];
}

const SetListList = ({ groupId, setlists }: SetlistProps) => {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Setlists</h2>
        <Button asChild className="bg-orange-500 hover:bg-orange-600">
          <Link href={`/groups/${groupId}/create-setlist`}>
            <Plus className="mr-2 h-4 w-4" />
            Criar Setlist
          </Link>
        </Button>
      </div>{" "}
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
          {" "}
          {setlists.slice(0, 10).map((setlist) => {
            return (
              <Card
                key={setlist.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader className="py-2">
                  <div className="flex justify-between items-center">
                    <Link
                      href={`/groups/${groupId}/setlist/${setlist.id}`}
                      className="flex items-center gap-4 flex-1"
                    >
                      <div className="h-20 w-20 rounded-lg overflow-hidden bg-orange-100 flex items-center justify-center">
                        <Image
                          src={setlist.imageUrl || "/placeholder-setlist.png"}
                          alt={setlist.title}
                          width={40}
                          height={40}
                          className="h-full w-full object-cover"
                          quality={80}
                        />
                      </div>
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
                    </Link>
                    <div className="flex items-center gap-2">
                      <div className="bg-orange-100 text-orange-800 px-2 py-1 rounded-md text-sm font-medium">
                        {setlist.musics?.length || 0} músicas
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      )}
      {setlists.length > 10 && (
        <div className="mt-4 text-center">
          <Button variant="outline" asChild>
            <Link href={`/groups/${groupId}/setlists`}>
              Ver Todas as Setlists
            </Link>
          </Button>
        </div>
      )}
    </>
  );
};

export default SetListList;
