import Link from "next/link";
import { Group } from "../types/group";
import { Music, Calendar, Users, ArrowRight } from "lucide-react";
import Image from "next/image";

interface GroupItemProps {
  group: Group;
  groupsInfo: {
    [key: string]: {
      stats: {
        musicsCount: number;
        setlistsCount: number;
        membersCount: number;
      };
    };
  };
}

const GroupItem = ({ group, groupsInfo }: GroupItemProps) => {
  const stats = groupsInfo[group.id]?.stats || {
    musicsCount: 0,
    setlistsCount: 0,
    membersCount: 0,
  };

  return (
    <Link href={`/groups/${group.id}`} className="group block">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-700 hover:border-orange-200 dark:hover:border-orange-800 group-hover:scale-[1.02]">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 flex items-center justify-center">
              <Image
                src={group.imageUrl || "/placeholder-groups.png"}
                alt={group.name}
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-200">
                {group.name}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {new Date(group.createdAt).toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all duration-200" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors duration-200">
            <Music className="h-5 w-5 text-orange-500 mx-auto mb-1" />
            <div className="font-semibold text-slate-900 dark:text-white">
              {stats.musicsCount}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Músicas
            </div>
          </div>
          <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors duration-200">
            <Calendar className="h-5 w-5 text-orange-500 mx-auto mb-1" />
            <div className="font-semibold text-slate-900 dark:text-white">
              {stats.setlistsCount}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Setlists
            </div>
          </div>
          <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors duration-200">
            <Users className="h-5 w-5 text-orange-500 mx-auto mb-1" />
            <div className="font-semibold text-slate-900 dark:text-white">
              {stats.membersCount}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Membros
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default GroupItem;
