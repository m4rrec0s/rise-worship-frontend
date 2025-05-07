"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, Search } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";

// Mock data for groups
const groups = {
  "1": { name: "Sunday Worship Team" },
  "2": { name: "Youth Worship" },
  "3": { name: "Midweek Service" },
};

// Mock search results
const searchResults = [
  {
    id: "1",
    title: "Amazing Grace",
    author: "John Newton",
    lyrics:
      "Amazing grace, how sweet the sound\nThat saved a wretch like me\nI once was lost, but now I'm found\nWas blind, but now I see",
  },
  {
    id: "2",
    title: "How Great Is Our God",
    author: "Chris Tomlin",
    lyrics:
      "How great is our God, sing with me\nHow great is our God, and all will see\nHow great, how great is our God",
  },
];

export default function CreateMusicPage() {
  const params = useParams();
  const groupId = params.groupId as string;
  const group = groups[groupId as keyof typeof groups];

  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [selectedSong, setSelectedSong] = useState<
    null | (typeof searchResults)[0]
  >(null);

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    key: "C",
    tempo: "",
    lyrics: "",
    chords: "",
  });

  if (!group) {
    return <div className="container mx-auto py-8">Group not found</div>;
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setShowResults(true);
    }
  };

  const handleSelectSong = (song: (typeof searchResults)[0]) => {
    setSelectedSong(song);
    setFormData({
      ...formData,
      title: song.title,
      author: song.author,
      lyrics: song.lyrics,
    });
    setShowResults(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleKeyChange = (value: string) => {
    setFormData({
      ...formData,
      key: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would handle the form submission
    console.log("Form submitted:", formData);
    // Redirect to the group
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-2 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/groups/${groupId}`}>
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Add New Song - {group.name}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search for Lyrics</CardTitle>
          <CardDescription>
            Search for a song to automatically fill in lyrics and details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for a song..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              onClick={handleSearch}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Search
            </Button>
          </div>

          {showResults && (
            <div className="mt-4 border rounded-md divide-y">
              {searchResults.map((song) => (
                <div
                  key={song.id}
                  className="p-3 hover:bg-orange-50 cursor-pointer"
                  onClick={() => handleSelectSong(song)}
                >
                  <div className="font-medium">{song.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {song.author}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Song Details</CardTitle>
            <CardDescription>Enter the details of the song</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Song Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="author">Author/Artist</Label>
                <Input
                  id="author"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="key">Key</Label>
                <Select value={formData.key} onValueChange={handleKeyChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a key" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="A#">A#</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                    <SelectItem value="C#">C#</SelectItem>
                    <SelectItem value="D">D</SelectItem>
                    <SelectItem value="D#">D#</SelectItem>
                    <SelectItem value="E">E</SelectItem>
                    <SelectItem value="F">F</SelectItem>
                    <SelectItem value="F#">F#</SelectItem>
                    <SelectItem value="G">G</SelectItem>
                    <SelectItem value="G#">G#</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tempo">Tempo (BPM)</Label>
                <Input
                  id="tempo"
                  name="tempo"
                  type="number"
                  value={formData.tempo}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lyrics">Lyrics</Label>
              <Textarea
                id="lyrics"
                name="lyrics"
                value={formData.lyrics}
                onChange={handleInputChange}
                rows={10}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="chords">Chords (Optional)</Label>
              <Textarea
                id="chords"
                name="chords"
                value={formData.chords}
                onChange={handleInputChange}
                rows={6}
              />
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" asChild>
            <Link href={`/groups/${groupId}`}>Cancel</Link>
          </Button>
          <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
            Save Song
          </Button>
        </div>
      </form>
    </div>
  );
}
