"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, Plus, Search, Calendar } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/app/components/ui/card";

const allSetlists = [
  {
    id: "1",
    title: "Sunday Morning - May 12",
    songs: 5,
    date: "May 12, 2024",
    leader: "John Doe",
  },
  {
    id: "2",
    title: "Sunday Evening - May 12",
    songs: 4,
    date: "May 12, 2024",
    leader: "Jane Smith",
  },
  {
    id: "3",
    title: "Midweek Service - May 15",
    songs: 3,
    date: "May 15, 2024",
    leader: "Mike Johnson",
  },
  {
    id: "4",
    title: "Sunday Morning - May 19",
    songs: 5,
    date: "May 19, 2024",
    leader: "John Doe",
  },
  {
    id: "5",
    title: "Sunday Evening - May 19",
    songs: 4,
    date: "May 19, 2024",
    leader: "Sarah Williams",
  },
  {
    id: "6",
    title: "Midweek Service - May 22",
    songs: 3,
    date: "May 22, 2024",
    leader: "Mike Johnson",
  },
  {
    id: "7",
    title: "Sunday Morning - May 26",
    songs: 5,
    date: "May 26, 2024",
    leader: "John Doe",
  },
  {
    id: "8",
    title: "Sunday Evening - May 26",
    songs: 4,
    date: "May 26, 2024",
    leader: "Jane Smith",
  },
];

// Mock data for groups
const groups = {
  "1": { name: "Sunday Worship Team" },
  "2": { name: "Youth Worship" },
  "3": { name: "Midweek Service" },
};

export default function SetlistsPage() {
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
        <h1 className="text-2xl font-bold">All Setlists - {group.name}</h1>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search setlists..." className="pl-10" />
        </div>
        <Button asChild className="bg-orange-500 hover:bg-orange-600">
          <Link href={`/groups/${groupId}/create-setlist`}>
            <Plus className="mr-2 h-4 w-4" />
            Create Setlist
          </Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {allSetlists.map((setlist) => (
          <Card key={setlist.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="py-4">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg">{setlist.title}</CardTitle>
                  <CardDescription>Leader: {setlist.leader}</CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1" />
                    {setlist.date}
                  </div>
                  <div className="bg-orange-100 text-orange-800 px-2 py-1 rounded-md text-sm font-medium">
                    {setlist.songs} songs
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
