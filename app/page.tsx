import Link from "next/link";
import { Music, Plus, Users, Calendar } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import Image from "next/image";

const groups = [
  {
    id: "1",
    name: "Sunday Worship Team",
    members: 12,
    songs: 45,
    setlists: 8,
    image: "https://drive.google.com/uc?id=1EeMy-kDvP9OFynxxEk7It3obafwk5U0a",
    lastActive: "2 days ago",
  },
  {
    id: "2",
    name: "Youth Worship",
    members: 8,
    songs: 32,
    setlists: 5,
    image: "https://drive.google.com/uc?id=1EeMy-kDvP9OFynxxEk7It3obafwk5U0a",
    lastActive: "Yesterday",
  },
  {
    id: "3",
    name: "Midweek Service",
    members: 6,
    songs: 28,
    setlists: 4,
    image: "https://drive.google.com/uc?id=1EeMy-kDvP9OFynxxEk7It3obafwk5U0a",
    lastActive: "Just now",
  },
  {
    id: "4",
    name: "Special Events Team",
    members: 10,
    songs: 38,
    setlists: 6,
    image: "https://drive.google.com/uc?id=1EeMy-kDvP9OFynxxEk7It3obafwk5U0a",
    lastActive: "3 days ago",
  },
  {
    id: "5",
    name: "Christmas Choir",
    members: 24,
    songs: 15,
    setlists: 2,
    image: "https://drive.google.com/uc?id=1EeMy-kDvP9OFynxxEk7It3obafwk5U0a",
    lastActive: "1 week ago",
  },
  {
    id: "6",
    name: "Acoustic Set",
    members: 4,
    songs: 22,
    setlists: 3,
    image: "https://drive.google.com/uc?id=1EeMy-kDvP9OFynxxEk7It3obafwk5U0a",
    lastActive: "5 days ago",
  },
];

export default function Home() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Your Worship Groups</h1>
          <p className="text-muted-foreground mt-1">
            Manage your worship teams, songs, and setlists
          </p>
        </div>
        <Button asChild className="bg-orange-500 hover:bg-orange-600">
          <Link href="/create-group">
            <Plus className="mr-2 h-4 w-4" />
            Create New Group
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <Link
            key={group.id}
            href={`/groups/${group.id}`}
            className="block group"
          >
            <Card className="h-full transition-all duration-200 hover:shadow-md hover:border-orange-200 group-hover:border-orange-200">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-4">
                  <div className="rounded-full overflow-hidden bg-orange-100 flex items-center justify-center border-2 border-orange-200">
                    <Image
                      src={group.image || "/placeholder.svg"}
                      alt={group.name}
                      width={100}
                      height={100}
                      className="object-cover"
                      priority
                    />
                  </div>
                  <div>
                    <CardTitle className="group-hover:text-orange-500 transition-colors">
                      {group.name}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      Active {group.lastActive}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="grid grid-cols-3 gap-2 mt-4">
                  <div className="flex flex-col items-center p-2 bg-muted rounded-md">
                    <Music className="h-4 w-4 text-orange-500 mb-1" />
                    <span className="text-sm font-medium">{group.songs}</span>
                    <span className="text-xs text-muted-foreground">Songs</span>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-muted rounded-md">
                    <Calendar className="h-4 w-4 text-orange-500 mb-1" />
                    <span className="text-sm font-medium">
                      {group.setlists}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Setlists
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-muted rounded-md">
                    <Users className="h-4 w-4 text-orange-500 mb-1" />
                    <span className="text-sm font-medium">{group.members}</span>
                    <span className="text-xs text-muted-foreground">
                      Members
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <Button
                  variant="ghost"
                  className="w-full text-orange-500 group-hover:bg-orange-50"
                >
                  View Group
                </Button>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
