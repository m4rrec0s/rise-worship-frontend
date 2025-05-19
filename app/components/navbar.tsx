"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Edit, LogOut, Menu, Music, Search, Settings, X } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";

import { useSidebar } from "@/app/components/ui/sidebar";
import { Input } from "./ui/input";
import { useAuth } from "../context/auth-context";
import Image from "next/image";
import { useState } from "react";

export function Navbar() {
  const { toggleSidebar } = useSidebar();
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuth();
  const [inputValue, setInputValue] = useState("");

  const isAuthPage = pathname === "/login" || pathname === "/register";
  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputValue.trim()) {
      activateSearch(inputValue.trim());
    }
  };

  const isGroupPage = pathname.startsWith("/groups");
  const isProfilePage = pathname.startsWith("/profile");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleClearSearch = () => {
    setInputValue("");
  };

  const handleSearchFocus = () => {
    if (inputValue.trim()) {
      activateSearch(inputValue.trim());
    } else {
      activateSearch("");
    }
  };
  const activateSearch = (query: string) => {
    if (typeof window !== "undefined" && window.riseWorshipSearch) {
      window.riseWorshipSearch.activate(query);
    }
  };

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

  if (isProfilePage) {
    return null;
  }

  return (
    <>
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

          {user && !isGroupPage && (
            <div className="flex-1 flex items-center justify-center px-4 sm:px-0">
              <form
                onSubmit={handleSearchSubmit}
                className="w-full max-w-md relative"
              >
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar grupos..."
                  className="w-full pl-10"
                  value={inputValue}
                  onChange={handleInputChange}
                  onFocus={handleSearchFocus}
                />
                {inputValue && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                    onClick={handleClearSearch}
                    type="button"
                  >
                    <span className="sr-only">Limpar</span>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </form>
            </div>
          )}

          <div className="ml-auto flex items-center gap-2">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full border-2 border-orange-500"
                  >
                    <div className="relative h-9 w-9 border p-0.5 rounded-full bg-orange-500">
                      {user?.imageUrl ? (
                        <Image
                          src={user?.imageUrl}
                          alt="User"
                          className="rounded-full"
                          fill
                          style={{ objectFit: "cover" }}
                          priority
                        />
                      ) : (
                        <div className="relative w-full h-full">
                          <Image
                            src="/placeholder-user.png"
                            alt="User"
                            fill
                            style={{ objectFit: "cover" }}
                            className="rounded-full"
                            priority
                          />
                        </div>
                      )}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Perfil</DropdownMenuLabel>
                  <DropdownMenuItem>
                    <div className="flex items-center">
                      {user?.imageUrl ? (
                        <Image
                          src={user?.imageUrl}
                          alt="User"
                          className="rounded-full"
                          width={32}
                          height={32}
                        />
                      ) : (
                        <Image
                          src="/placeholder-user.png"
                          alt="User"
                          className="rounded-full"
                          width={32}
                          height={32}
                        />
                      )}
                      <div className="ml-2 flex flex-col">
                        <span className="text-sm font-semibold">
                          {user?.name}
                        </span>
                        <span className="text-xs font-medium text-gray-500">
                          {user?.email}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <Edit className="mr-2 h-4 w-4" />
                      Editar Perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => logout()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex gap-2">
                <Button variant="ghost" asChild size="sm">
                  <Link href="/login">Entrar</Link>
                </Button>
                <Button
                  className="bg-orange-500 hover:bg-orange-600"
                  asChild
                  size="sm"
                >
                  <Link href="/register">Cadastrar</Link>
                </Button>
              </div>
            )}
          </div>
        </div>{" "}
      </header>
    </>
  );
}
