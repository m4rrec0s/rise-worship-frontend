"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, Settings } from "lucide-react";
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

// Mock data for groups
const groups = [
  {
    id: "1",
    name: "Sunday Worship Team",
    image: "https://drive.google.com/uc?id=1EeMy-kDvP9OFynxxEk7It3obafwk5U0a",
  },
  {
    id: "2",
    name: "Youth Worship",
    image: "https://drive.google.com/uc?id=1EeMy-kDvP9OFynxxEk7It3obafwk5U0a",
  },
  {
    id: "3",
    name: "Midweek Service",
    image: "https://drive.google.com/uc?id=1EeMy-kDvP9OFynxxEk7It3obafwk5U0a",
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");

  // Don't render sidebar on auth pages
  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="px-4 py-3">
        <div className="mt-4">
          <Input
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Your Groups</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredGroups.map((group) => (
                <SidebarMenuItem key={group.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.includes(`/groups/${group.id}`)}
                  >
                    <Link href={`/groups/${group.id}`}>
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage
                          src={group.image || "/placeholder.svg"}
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
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/create-group" className="text-orange-500">
                    <Plus className="h-5 w-5" />
                    <span>Create New Group</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/settings">
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
