import { Music } from "@/app/types/music";
import { SetlistMusic } from "@/app/types/setlistMusic";
import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { ChevronRight } from "lucide-react";

interface MusicItemProps {
  groupId: string;
  item: Music | SetlistMusic;
  className?: string;
}

const MusicItem = ({ groupId, item, className = "" }: MusicItemProps) => {
  const isSetlistMusic = "order" in item;

  const musicData: Music | undefined = isSetlistMusic
    ? (item as SetlistMusic).music
    : (item as Music);

  if (!musicData) {
    return null;
  }

  return (
    <div className={className}>
      <Link
        href={`/groups/${groupId}/music/${musicData.id}`}
        className="block group"
      >
        <Card className="hover:shadow-xl transition-all duration-200 border-0 bg-gradient-to-br from-white to-orange-50/40 dark:from-slate-900 dark:to-orange-950/10 overflow-hidden">
          <CardHeader className="py-4 px-5">
            <div className="flex justify-between items-center gap-3 flex-nowrap w-full min-w-0">
              <div className="flex flex-col sm:max-w-none max-w-[70vw] min-w-0 w-0 flex-1">
                <CardTitle className="sm:text-xl text-base font-bold bg-gradient-to-r from-slate-900 to-orange-600 dark:from-white dark:to-orange-400 bg-clip-text text-transparent group-hover:brightness-110 transition-all truncate">
                  {musicData.title}
                </CardTitle>
                <CardDescription className="max-sm:text-xs text-slate-500 dark:text-slate-300 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors truncate">
                  {musicData.author}
                </CardDescription>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300 px-2 py-1 rounded-md text-xs font-semibold shadow-sm whitespace-nowrap">
                  Tom: {musicData.tone}
                </div>
                <ChevronRight className="h-5 w-5 text-orange-400 group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </div>
            </div>
          </CardHeader>
        </Card>
      </Link>
    </div>
  );
};

export default MusicItem;
