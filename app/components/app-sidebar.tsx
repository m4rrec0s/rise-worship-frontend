"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, Settings, LoaderCircle } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/app/components/ui/sidebar";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/components/ui/avatar";
import { Input } from "@/app/components/ui/input";
import { useApi } from "@/app/hooks/use-api";
import { useAuth } from "@/app/context/auth-context";
import { Group } from "@/app/types/group";

export function AppSidebar() {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const api = useApi();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchGroups = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        const response = await api.getGroupsByUserId(user.id);
        const data = response
          ? (response as Array<Group | { groupId: string; group: Group }>)
          : [];

        const groupsData = data
          .map((item) => {
            if ("groupId" in item && "group" in item) {
              return item.group;
            }
            return item as Group;
          })
          .filter(Boolean);

        setUserGroups(groupsData);
      } catch (error) {
        console.error("Erro ao carregar grupos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && user) {
      fetchGroups();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  const filteredGroups = userGroups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <Sidebar className="border-r">
      <SidebarHeader className="px-4 py-3">
        <div className="mt-4">
          <Input
            placeholder="Buscar grupos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent className="pb-3">
        <SidebarGroup>
          <SidebarGroupLabel>Seus Grupos</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {isLoading ? (
                <SidebarMenuItem>
                  <div className="flex items-center justify-center w-full py-4">
                    <LoaderCircle className="h-5 w-5 animate-spin text-orange-500" />
                  </div>
                </SidebarMenuItem>
              ) : filteredGroups.length > 0 ? (
                filteredGroups.map((group) => (
                  <SidebarMenuItem key={group.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname.includes(`/groups/${group.id}`)}
                    >
                      <Link href={`/groups/${group.id}`}>
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarImage
                            src={group.imageUrl || "/placeholder-groups.png"}
                            alt={group.name}
                          />
                          <AvatarFallback>
                            {group.name.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{group.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              ) : (
                <SidebarMenuItem>
                  <div className="text-sm text-muted-foreground py-2 px-2">
                    {searchQuery
                      ? "Nenhum grupo encontrado"
                      : "Você ainda não participa de nenhum grupo"}
                  </div>
                </SidebarMenuItem>
              )}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/create-group" className="text-orange-500">
                    <Plus className="h-5 w-5" />
                    <span>Criar Novo Grupo</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="pb-5">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/settings">
                <Settings className="h-5 w-5" />
                <span>Configurações</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
