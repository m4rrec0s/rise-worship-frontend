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
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="py-4">
            <div className="flex justify-between items-center gap-2">
              <div className="flex flex-col sm:max-w-none max-w-[70%]">
                <CardTitle className="sm:text-lg text-sm">
                  {musicData.title}
                </CardTitle>
                <CardDescription className="max-sm:text-xs">
                  {musicData.author}
                </CardDescription>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-orange-100 text-orange-800 px-2 py-1 rounded-md text-sm font-medium text-nowrap">
                  Tom: {musicData.tone}
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </CardHeader>
        </Card>
      </Link>
    </div>
  );
};

export default MusicItem;
