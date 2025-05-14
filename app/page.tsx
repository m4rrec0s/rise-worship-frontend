"use client";

import { useAuth } from "@/app/context/auth-context";
import { GroupListing } from "@/app/components/group-listing";
import { LandingPage } from "@/app/components/landing-page";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoadingIcon } from "./components/loading-icon";

export default function Home() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {}, [isAuthenticated, router, user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingIcon />
      </div>
    );
  }

  return isAuthenticated ? <GroupListing /> : <LandingPage />;
}
