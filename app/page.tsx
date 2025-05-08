"use client";

import { useAuth } from "@/app/context/auth-context";
import { GroupListing } from "@/app/components/group-listing";
import { LandingPage } from "@/app/components/landing-page";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log("User:", user);
    console.log("isAuthenticated:", isAuthenticated);
  }, [isAuthenticated, router, user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="animate-pulse text-orange-500">Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? <GroupListing /> : <LandingPage />;
}
