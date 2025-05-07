"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Music, Plus, List, Users } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar"

// Mock data for songs
const songs = [
  { id: "1", title: "Amazing Grace", key: "G", author: "John Newton" },
  { id: "2", title: "How Great Is Our God", key: "C", author: "Chris Tomlin" },
  { id: "3", title: "10,000 Reasons", key: "D", author: "Matt Redman" },
  { id: "4", title: "Oceans", key: "D", author: "Hillsong United" },
  { id: "5", title: "What A Beautiful Name", key: "D", author: "Hillsong Worship" },
]

// Mock data for setlists
const setlists = [
  { id: "1", title: "Sunday Morning - May 12", songs: 5, date: "May 12, 2024" },
  { id: "2", title: "Sunday Evening - May 12", songs: 4, date: "May 12, 2024" },
  { id: "3", title: "Midweek Service - May 15", songs: 3, date: "May 15, 2024" },
]

// Mock data for members
const members = [
  { id: "1", name: "John Doe", role: "Leader", image: "/placeholder.svg?height=40&width=40" },
  { id: "2", name: "Jane Smith", role: "Vocalist", image: "/placeholder.svg?height=40&width=40" },
  { id: "3", name: "Mike Johnson", role: "Guitarist", image: "/placeholder.svg?height=40&width=40" },
  { id: "4", name: "Sarah Williams", role: "Pianist", image: "/placeholder.svg?height=40&width=40" },
]

// Mock data for groups
const groups = {
  "1": { name: "Sunday Worship Team", image: "/placeholder.svg?height=80&width=80" },
  "2": { name: "Youth Worship", image: "/placeholder.svg?height=80&width=80" },
  "3": { name: "Midweek Service", image: "/placeholder.svg?height=80&width=80" },
}

export default function GroupPage() {
  const params = useParams()
  const groupId = params.groupId as string
  const group = groups[groupId as keyof typeof groups]
  const [activeTab, setActiveTab] = useState("songs")

  if (!group) {
    return <div className="container mx-auto py-8">Group not found</div>
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="h-16 w-16 rounded-full overflow-hidden bg-orange-100 flex items-center justify-center">
          <img src={group.image || "/placeholder.svg"} alt={group.name} className="h-full w-full object-cover" />
        </div>
        <h1 className="text-3xl font-bold">{group.name}</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="songs" className="flex items-center gap-2">
            <Music className="h-4 w-4" />
            Songs
          </TabsTrigger>
          <TabsTrigger value="setlists" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Setlists
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Members
          </TabsTrigger>
        </TabsList>

        <TabsContent value="songs">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Songs</h2>
            <Button asChild className="bg-orange-500 hover:bg-orange-600">
              <Link href={`/groups/${groupId}/create-music`}>
                <Plus className="mr-2 h-4 w-4" />
                Add Song
              </Link>
            </Button>
          </div>
          <div className="grid gap-4">
            {songs.map((song) => (
              <Card key={song.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="py-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg">{song.title}</CardTitle>
                      <CardDescription>{song.author}</CardDescription>
                    </div>
                    <div className="bg-orange-100 text-orange-800 px-2 py-1 rounded-md text-sm font-medium">
                      Key: {song.key}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Button variant="outline" asChild>
              <Link href={`/groups/${groupId}/musics`}>View All Songs</Link>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="setlists">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Setlists</h2>
            <Button asChild className="bg-orange-500 hover:bg-orange-600">
              <Link href={`/groups/${groupId}/create-setlist`}>
                <Plus className="mr-2 h-4 w-4" />
                Create Setlist
              </Link>
            </Button>
          </div>
          <div className="grid gap-4">
            {setlists.map((setlist) => (
              <Card key={setlist.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="py-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg">{setlist.title}</CardTitle>
                      <CardDescription>{setlist.date}</CardDescription>
                    </div>
                    <div className="bg-orange-100 text-orange-800 px-2 py-1 rounded-md text-sm font-medium">
                      {setlist.songs} songs
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Button variant="outline" asChild>
              <Link href={`/groups/${groupId}/setlists`}>View All Setlists</Link>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="members">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Members</h2>
            <Button asChild className="bg-orange-500 hover:bg-orange-600">
              <Link href={`/groups/${groupId}/invite`}>
                <Plus className="mr-2 h-4 w-4" />
                Invite Member
              </Link>
            </Button>
          </div>
          <div className="grid gap-4">
            {members.map((member) => (
              <Card key={member.id} className="hover:shadow-md transition-shadow">
                <CardContent className="py-4 flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={member.image || "/placeholder.svg"} alt={member.name} />
                    <AvatarFallback>{member.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{member.name}</h3>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
