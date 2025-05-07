"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, Plus, Search } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/app/components/ui/card";

// Mock data for songs
const allSongs = [
  {
    id: "1",
    title: "Amazing Grace",
    key: "G",
    author: "John Newton",
    lastPlayed: "May 10, 2024",
  },
  {
    id: "2",
    title: "How Great Is Our God",
    key: "C",
    author: "Chris Tomlin",
    lastPlayed: "May 3, 2024",
  },
  {
    id: "3",
    title: "10,000 Reasons",
    key: "D",
    author: "Matt Redman",
    lastPlayed: "Apr 26, 2024",
  },
  {
    id: "4",
    title: "Oceans",
    key: "D",
    author: "Hillsong United",
    lastPlayed: "Apr 19, 2024",
  },
  {
    id: "5",
    title: "What A Beautiful Name",
    key: "D",
    author: "Hillsong Worship",
    lastPlayed: "Apr 12, 2024",
  },
  {
    id: "6",
    title: "Great Are You Lord",
    key: "A",
    author: "All Sons & Daughters",
    lastPlayed: "Apr 5, 2024",
  },
  {
    id: "7",
    title: "Good Good Father",
    key: "A",
    author: "Chris Tomlin",
    lastPlayed: "Mar 29, 2024",
  },
  {
    id: "8",
    title: "Cornerstone",
    key: "C",
    author: "Hillsong Worship",
    lastPlayed: "Mar 22, 2024",
  },
  {
    id: "9",
    title: "Build My Life",
    key: "D",
    author: "Pat Barrett",
    lastPlayed: "Mar 15, 2024",
  },
  {
    id: "10",
    title: "Raise A Hallelujah",
    key: "G",
    author: "Bethel Music",
    lastPlayed: "Mar 8, 2024",
  },
];

// Mock data for groups
const groups = {
  "1": { name: "Sunday Worship Team" },
  "2": { name: "Youth Worship" },
  "3": { name: "Midweek Service" },
};

export default function SongsPage() {
  const params = useParams();
  const groupId = params.groupId as string;
  const group = groups[groupId as keyof typeof groups];

  if (!group) {
    return <div className="container mx-auto py-8">Group not found</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-2 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/groups/${groupId}`}>
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">All Songs - {group.name}</h1>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search songs..." className="pl-10" />
        </div>
        <Button asChild className="bg-orange-500 hover:bg-orange-600">
          <Link href={`/groups/${groupId}/create-music`}>
            <Plus className="mr-2 h-4 w-4" />
            Add Song
          </Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {allSongs.map((song) => (
          <Card key={song.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="py-4">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg">{song.title}</CardTitle>
                  <CardDescription>{song.author}</CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground">
                    Last played: {song.lastPlayed}
                  </div>
                  <div className="bg-orange-100 text-orange-800 px-2 py-1 rounded-md text-sm font-medium">
                    Key: {song.key}
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
