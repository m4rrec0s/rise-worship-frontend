"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Music, User } from "lucide-react";
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

export function Navbar() {
  const { toggleSidebar } = useSidebar();
  const pathname = usePathname();

  // Check if we're on an auth page
  const isAuthPage = pathname === "/login" || pathname === "/register";

  // Extract group ID from path if we're on a group page
  const groupIdMatch = pathname.match(/\/groups\/([^/]+)/);
  const groupId = groupIdMatch ? groupIdMatch[1] : null;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center px-4 sm:px-6">
        <div className="flex items-center gap-2 mr-4">
          {!isAuthPage && (
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
          {!isAuthPage ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src="/placeholder.svg?height=32&width=32"
                      alt="User"
                    />
                    <AvatarFallback>JD</AvatarFallback>
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
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/login">Logout</Link>
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
