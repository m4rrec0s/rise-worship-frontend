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
import { LoadingIcon } from "../loading-icon";

interface SetlistProps {
  groupId: string;
  userPermissions: string;
  setlists: Setlist[];
  isLoading: boolean;
}

const SetListList = ({
  groupId,
  setlists,
  userPermissions,
  isLoading,
}: SetlistProps) => {
  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center py-4">
        <LoadingIcon size={30} />
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-orange-600 dark:from-white dark:to-orange-400 bg-clip-text text-transparent">
          Setlists
        </h2>
        {(userPermissions === "edit" || userPermissions === "admin") && (
          <Button
            asChild
            className="bg-orange-500 hover:bg-orange-600 shadow-lg rounded-xl font-semibold"
          >
            <Link href={`/groups/${groupId}/create-setlist`}>
              <Plus className="mr-2 h-5 w-5" />
              Criar Setlist
            </Link>
          </Button>
        )}
      </div>
      {setlists.length === 0 ? (
        <Card className="bg-gradient-to-br from-white to-orange-50/40 dark:from-slate-900 dark:to-orange-950/10 border-0 shadow-inner rounded-2xl">
          <CardContent className="py-10 text-center">
            <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">
              Nenhuma setlist encontrada
            </h3>
            <p className="text-slate-500 dark:text-slate-300 mb-4">
              Você ainda não possui setlists criadas.{" "}
              {userPermissions === "edit" || userPermissions === "admin"
                ? "Crie uma setlist para começar."
                : "As setlists são criadas por administradores ou editores do grupo."}
            </p>
            {(userPermissions === "edit" || userPermissions === "admin") && (
              <Button
                asChild
                className="bg-orange-500 hover:bg-orange-600 shadow rounded-xl"
              >
                <Link href={`/groups/${groupId}/create-setlist`}>
                  <Plus className="mr-2 h-5 w-5" />
                  Criar Primeira Setlist
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {setlists.map((setlist) => (
            <Card
              key={setlist.id}
              className="hover:shadow-xl hover:scale-[1.015] transition-all duration-200 border-0 bg-gradient-to-br from-white to-orange-50/40 dark:from-slate-900 dark:to-orange-950/10 group-hover:ring-2 group-hover:ring-orange-400/30 rounded-2xl overflow-hidden"
            >
              <CardHeader className="py-3 px-4">
                <div className="flex justify-between items-center gap-3 w-full min-w-0">
                  <Link
                    href={`/groups/${groupId}/setlist/${setlist.id}`}
                    className="flex items-center gap-4 flex-1 min-w-0"
                  >
                    <div className="h-16 w-16 rounded-xl overflow-hidden bg-orange-100 flex items-center justify-center border border-orange-100 dark:border-orange-900/30">
                      <Image
                        src={setlist.imageUrl || "/placeholder-setlist.png"}
                        alt={setlist.title}
                        width={64}
                        height={64}
                        className="h-full w-full object-cover"
                        quality={80}
                      />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-lg truncate bg-gradient-to-r from-slate-900 to-orange-600 dark:from-white dark:to-orange-400 bg-clip-text text-transparent">
                        {setlist.title}
                      </CardTitle>
                      <CardDescription className="truncate text-slate-500 dark:text-slate-300">
                        {new Date(setlist.createdAt).toLocaleDateString(
                          "pt-BR"
                        )}
                      </CardDescription>
                    </div>
                  </Link>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300 px-2 py-1 rounded-md text-xs font-semibold shadow-sm whitespace-nowrap">
                      {setlist.musics?.length || 0} músicas
                    </div>
                    <ChevronRight className="h-5 w-5 text-orange-400 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </>
  );
};

export default SetListList;
