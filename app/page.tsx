"use client";

import { useAuth } from "@/app/context/auth-context";
import { GroupListing } from "@/app/components/group-listing";
import { LandingPage } from "@/app/components/landing-page";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LoadingIcon } from "./components/loading-icon";
import SearchPage from "./components/search/search-page";

export default function Home() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {}, [isAuthenticated, router, user]);

  // Função para ativar o modo de pesquisa
  const activateSearch = (query: string) => {
    setSearchQuery(query);
    setIsSearchActive(true);
  };

  // Função para desativar o modo de pesquisa
  const deactivateSearch = () => {
    setSearchQuery("");
    setIsSearchActive(false);
  };

  // Expose the search functions to the global window object
  useEffect(() => {
    // Define o objeto window com as funções de pesquisa
    if (typeof window !== "undefined") {
      window.riseWorshipSearch = {
        activate: activateSearch,
        deactivate: deactivateSearch,
      };
    }

    // Cleanup function when component unmounts
    return () => {
      if (typeof window !== "undefined" && window.riseWorshipSearch) {
        delete window.riseWorshipSearch;
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingIcon />
      </div>
    );
  }

  if (isSearchActive && searchQuery) {
    return (
      <SearchPage searchQuery={searchQuery} onClearSearch={deactivateSearch} />
    );
  }

  return isAuthenticated ? <GroupListing /> : <LandingPage />;
}
