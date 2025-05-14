"use client";

import { Music } from "lucide-react";
import { cn } from "@/app/lib/utils";

interface LoadingIconProps {
  className?: string;
  size?: number;
}

export function LoadingIcon({ className, size = 30 }: LoadingIconProps) {
  return (
    <div className={cn("relative inline-block", className)}>
      <Music size={size} className="text-gray-300" />

      <div className="absolute inset-0 overflow-hidden">
        <div className="fillOverlay">
          <Music size={size} className="text-orange-500" />
        </div>
      </div>
    </div>
  );
}
