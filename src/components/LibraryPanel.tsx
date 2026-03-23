import { useState, useEffect } from "react";
import { Search, Plus, Book, Music } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { searchBibleVerses, getVerseDisplay, loadBible, type BibleVerse } from "@/lib/bible-data";
import { searchSongs, type Song } from "@/lib/song-data";
import { useProjection } from "@/contexts/ProjectionContext";
import { ServiceItem, SlideData } from "@/lib/service-types";

export function LibraryPanel() {
  const [search, setSearch] = useState("");
  const [bibleLoaded, setBibleLoaded] = useState(false);
  const { addServiceItem } = useProjection();

  useEffect(() => {
    loadBible().then(() => setBibleLoaded(true));
  }, []);

  const bibleResults = bibleLoaded ? searchBibleVerses(search) : [];
  const songResults = searchSongs(search);

  const addScripture = (bookName: string, chapter: number, verses: BibleVerse[]) => {
    const slides: SlideData[] = verses.map((v) => ({
      id: crypto.randomUUID(),
      title: "",
      reference: getVerseDisplay(v),
      bodyLines: [v.text],
    }));
    const item: ServiceItem = {
      id: crypto.randomUUID(),
      type: "scripture",
      title: `${bookName} ${chapter}`,
      subtitle: `${verses.length} verse${verses.length > 1 ? "s" : ""}`,
      slides,
    };
    addServiceItem(item);
  };

  const addSong = (song: Song) => {
    const slides: SlideData[] = song.sections.map((sec) => ({
      id: crypto.randomUUID(),
      title: sec.label,
      bodyLines: sec.lines,
      subtitle: song.title,
    }));
    const item: ServiceItem = {
      id: crypto.randomUUID(),
      type: "song",
      title: song.title,
      subtitle: song.author,
      slides,
      sourceId: song.id,
    };
    addServiceItem(item);
  };

  // Group bible results by book+chapter
  const groupedVerses = bibleResults.reduce<Record<string, BibleVerse[]>>((acc, v) => {
    const key = `${v.book_name} ${v.chapter}`;
    (acc[key] = acc[key] || []).push(v);
    return acc;
  }, {});

  return (
    <div className="panel flex flex-col h-full">
      <div className="panel-header">
        <span className="panel-header-title">Library</span>
        {!bibleLoaded && <span className="text-[9px] text-muted-foreground">Loading KJV...</span>}
      </div>
      <div className="p-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search Bible or songs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm bg-secondary border-0"
          />
        </div>
      </div>
      <Tabs defaultValue="bible" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="mx-2 bg-secondary">
          <TabsTrigger value="bible" className="text-xs gap-1.5">
            <Book className="w-3 h-3" /> Bible
          </TabsTrigger>
          <TabsTrigger value="songs" className="text-xs gap-1.5">
            <Music className="w-3 h-3" /> Songs
          </TabsTrigger>
        </TabsList>
        <TabsContent value="bible" className="flex-1 overflow-y-auto px-2 pb-2 mt-0">
          {search.length < 2 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              Type to search Bible verses
            </p>
          ) : Object.keys(groupedVerses).length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No results</p>
          ) : (
            Object.entries(groupedVerses).map(([key, verses]) => (
              <div key={key} className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold">{key}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 text-xs gap-1 text-primary"
                    onClick={() => addScripture(verses[0].book_name, verses[0].chapter, verses)}
                  >
                    <Plus className="w-3 h-3" /> Add All
                  </Button>
                </div>
                {verses.map((v) => (
                  <div key={`${v.book_name}${v.chapter}:${v.verse}`} className="text-xs text-muted-foreground mb-1 pl-2 border-l border-border">
                    <span className="text-foreground font-medium">v{v.verse}</span> {v.text.slice(0, 80)}...
                  </div>
                ))}
              </div>
            ))
          )}
        </TabsContent>
        <TabsContent value="songs" className="flex-1 overflow-y-auto px-2 pb-2 mt-0">
          {songResults.map((song) => (
            <div
              key={song.id}
              className="flex items-center gap-2 p-2 rounded-md hover:bg-secondary cursor-pointer group mb-1"
              onClick={() => addSong(song)}
            >
              <Music className="w-4 h-4 text-accent shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{song.title}</div>
                <div className="text-xs text-muted-foreground truncate">{song.author}</div>
              </div>
              <Plus className="w-4 h-4 opacity-0 group-hover:opacity-100 text-primary" />
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
