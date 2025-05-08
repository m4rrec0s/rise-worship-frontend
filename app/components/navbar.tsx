"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, Music, Settings, User } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/components/ui/avatar";
import { useSidebar } from "@/app/components/ui/sidebar";
import { Input } from "./ui/input";
import { useAuth } from "../context/auth-context";
import Image from "next/image";

export function Navbar() {
  const { toggleSidebar } = useSidebar();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();

  // Check if we're on an auth page
  const isAuthPage = pathname === "/login" || pathname === "/register";

  const groupIdMatch = pathname.match(/\/groups\/([^/]+)/);
  const groupId = groupIdMatch ? groupIdMatch[1] : null;

  if (isAuthPage) {
    return (
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="flex h-16 items-center px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Music className="h-6 w-6 text-orange-500" />
            <h1 className="text-xl font-bold inline-block">Rise Worship</h1>
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="w-full flex justify-center h-16 items-center px-4 sm:px-6 lg:px-20">
        <div className="flex max-w-lg items-center gap-2 mr-4">
          {!isAuthPage && isAuthenticated && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="md:flex"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          )}
          <Link href="/" className="flex items-center gap-2">
            <Music className="h-6 w-6 text-orange-500" />
            <h1 className="text-xl font-bold hidden sm:inline-block">
              Rise Worship
            </h1>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-4 sm:px-0">
          <Input
            type="text"
            placeholder="Search for groups, songs, or setlists..."
            className="hidden sm:block w-full max-w-md"
          />
        </div>

        {groupId && (
          <nav className="flex-1 flex items-center">
            <div className="flex space-x-1">
              <Button variant="ghost" asChild className="text-sm">
                <Link href={`/groups/${groupId}`}>Overview</Link>
              </Button>
              <Button variant="ghost" asChild className="text-sm">
                <Link href={`/groups/${groupId}/musics`}>Songs</Link>
              </Button>
              <Button variant="ghost" asChild className="text-sm">
                <Link href={`/groups/${groupId}/setlists`}>Setlists</Link>
              </Button>
              <Button variant="ghost" asChild className="text-sm">
                <Link href={`/groups/${groupId}/members`}>Members</Link>
              </Button>
            </div>
          </nav>
        )}

        <div className="ml-auto flex items-center gap-2">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-9 w-9 border p-0.5">
                    <AvatarImage src={user?.imageUrl} alt="User" />
                    <AvatarFallback>
                      <Image
                        src="/placeholder-user.png"
                        alt="User"
                        fill
                        sizes="36px"
                        className="h-full w-full object-cover"
                        priority
                      />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/login">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" asChild size="sm">
                <Link href="/login">Login</Link>
              </Button>
              <Button
                className="bg-orange-500 hover:bg-orange-600"
                asChild
                size="sm"
              >
                <Link href="/register">Register</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
