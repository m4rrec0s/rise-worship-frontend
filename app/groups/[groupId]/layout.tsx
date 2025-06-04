"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { Music, List, Users, Edit, ArrowLeft } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import Image from "next/image";
import { useApi } from "@/app/hooks/use-api";
import { Group } from "@/app/types/group";
import { LoadingIcon } from "@/app/components/loading-icon";
import { useAuth } from "@/app/context/auth-context";
import { toast } from "sonner";

interface MemberData {
  id: string;
  permission: string;
  user: {
    id: string;
    name: string;
    email: string;
    imageUrl?: string;
  };
}

export default function GroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const api = useApi();
  const groupId = params.groupId as string;
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<MemberData[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const reloadGroupData = useCallback(async () => {
    api.clearSpecificCache(`group_${groupId}`);
    api.clearSpecificCache(`group_members_${groupId}`);

    setIsLoading(true);
    try {
      const response = await api.getGroupById(groupId);
      if (!response) {
        toast.error("Grupo não encontrado");
        return;
      }
      setGroup(response);

      const membersResponse = await api.getGroupMembers(groupId);
      setMembers(membersResponse);

      const isUserAdmin = membersResponse.some(
        (member: MemberData) =>
          member.user.id === user?.id && member.permission === "admin"
      );
      setIsAdmin(isUserAdmin);
    } catch (error) {
      console.error("Erro ao carregar grupo:", error);
    } finally {
      setIsLoading(false);
    }
  }, [api, groupId, user?.id]);

  useEffect(() => {
    if (user) {
      reloadGroupData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getActiveSection = () => {
    if (pathname.includes("/members")) return "members";
    if (pathname.includes("/setlists")) return "setlists";
    return "songs";
  };

  const navigationItems = [
    {
      id: "songs",
      label: "Músicas",
      icon: Music,
      href: `/groups/${groupId}`,
    },
    {
      id: "setlists",
      label: "Setlists",
      icon: List,
      href: `/groups/${groupId}/setlists`,
    },
    {
      id: "members",
      label: "Membros",
      icon: Users,
      href: `/groups/${groupId}/members`,
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-orange-950/10">
        <div className="container mx-auto py-12 px-6 flex justify-center items-center min-h-[70vh]">
          <LoadingIcon />
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-orange-950/10">
        <div className="container mx-auto py-12 px-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Grupo não encontrado
          </h1>
          <Button asChild className="bg-orange-500 hover:bg-orange-600">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para grupos
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!navigationItems.some((item) => pathname === item.href)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-orange-950/10">
        <div className="container mx-auto py-8 px-6">{children}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-orange-950/10">
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="container mx-auto py-8 px-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-start gap-6">
              <div className="relative h-20 w-20 rounded-2xl overflow-hidden bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 flex items-center justify-center shadow-lg">
                <Image
                  src={group.imageUrl || "/placeholder-groups.png"}
                  alt={group.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                  {group.name}
                </h1>
                <p className="sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                  {group.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                asChild
                variant="outline"
                className="border-slate-200 dark:border-slate-700"
              >
                <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Link>
              </Button>
              {isAdmin && (
                <Button
                  asChild
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg"
                >
                  <Link href={`/groups/${groupId}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar Grupo
                  </Link>
                </Button>
              )}
            </div>
          </div>

          <div className="mt-8">
            <nav className="flex space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = getActiveSection() === item.id;

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 font-medium text-sm sm:text-base ${
                      isActive
                        ? "bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-sm"
                        : "text-slate-600 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-white/50 dark:hover:bg-slate-700/50"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto py-8 px-6">{children}</div>
    </div>
  );
}
