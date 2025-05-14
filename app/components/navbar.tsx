"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, Music, Search, Settings, User, X } from "lucide-react";
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
import { useState } from "react";
import SearchResults from "./search/search-results";

export function Navbar() {
  const { toggleSidebar } = useSidebar();
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // Check if we're on an auth page
  const isAuthPage = pathname === "/login" || pathname === "/register";

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setSearchQuery(inputValue.trim());
      setIsSearchOpen(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleClearSearch = () => {
    setInputValue("");
    setSearchQuery("");
    setIsSearchOpen(false);
  };

  const handleSearchFocus = () => {
    if (inputValue.trim()) {
      setSearchQuery(inputValue.trim());
      setIsSearchOpen(true);
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

          <div className="ml-auto flex items-center gap-2">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-9 w-9 border p-0.5">
                      <AvatarImage
                        src={user?.imageUrl}
                        alt="User"
                        className="object-cover"
                        sizes="36px"
                      />
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
                  <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" />
                      Perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      Configurações
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
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
        </div>
      </header>
      <SearchResults
        searchQuery={searchQuery}
        isOpen={isSearchOpen}
        onClose={handleClearSearch}
      />
    </>
  );
}
