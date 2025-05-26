"use client";

import { LoadingIcon } from "@/app/components/loading-icon";

export default function CipherEditLoading() {
  return (
    <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[60vh]">
      <LoadingIcon />
    </div>
  );
}
