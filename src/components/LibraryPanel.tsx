import { useState, useEffect, useMemo } from "react";
import { Search, Plus, Book, Music, ChevronRight, ChevronLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  searchBibleVerses,
  getVerseDisplay,
  loadBible,
  getAllBooks,
  getChaptersForBook,
  getVersesForChapter,
  type BibleVerse,
} from "@/lib/bible-data";
import { searchSongs, type Song } from "@/lib/song-data";
import { useProjection } from "@/contexts/ProjectionContext";
import { ServiceItem, SlideData } from "@/lib/service-types";

type BrowseView = "books" | "chapters" | "verses";

const OT_BOOKS = [
  "Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges","Ruth",
  "1 Samuel","2 Samuel","1 Kings","2 Kings","1 Chronicles","2 Chronicles",
  "Ezra","Nehemiah","Esther","Job","Psalms","Proverbs","Ecclesiastes",
  "Song of Solomon","Isaiah","Jeremiah","Lamentations","Ezekiel","Daniel",
  "Hosea","Joel","Amos","Obadiah","Jonah","Micah","Nahum","Habakkuk",
  "Zephaniah","Haggai","Zechariah","Malachi",
];

const NT_BOOKS = [
  "Matthew","Mark","Luke","John","Acts","Romans","1 Corinthians","2 Corinthians",
  "Galatians","Ephesians","Philippians","Colossians","1 Thessalonians",
  "2 Thessalonians","1 Timothy","2 Timothy","Titus","Philemon","Hebrews",
  "James","1 Peter","2 Peter","1 John","2 John","3 John","Jude","Revelation",
];

export function LibraryPanel() {
  const [search, setSearch] = useState("");
  const [bibleLoaded, setBibleLoaded] = useState(false);
  const [browseView, setBrowseView] = useState<BrowseView>("books");
  const [selectedBook, setSelectedBook] = useState("");
  const [selectedChapter, setSelectedChapter] = useState(0);
  const { addServiceItem } = useProjection();

  useEffect(() => {
    loadBible().then(() => setBibleLoaded(true));
  }, []);

  const isSearching = search.trim().length >= 2;
  const bibleResults = bibleLoaded && isSearching ? searchBibleVerses(search) : [];
  const songResults = searchSongs(search);

  const chapters = useMemo(
    () => (selectedBook ? getChaptersForBook(selectedBook) : []),
    [selectedBook, bibleLoaded]
  );

  const chapterVerses = useMemo(
    () => (selectedBook && selectedChapter ? getVersesForChapter(selectedBook, selectedChapter) : []),
    [selectedBook, selectedChapter, bibleLoaded]
  );

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

  // Group bible search results by book+chapter
  const groupedVerses = bibleResults.reduce<Record<string, BibleVerse[]>>((acc, v) => {
    const key = `${v.book_name} ${v.chapter}`;
    (acc[key] = acc[key] || []).push(v);
    return acc;
  }, {});

  const selectBook = (book: string) => {
    setSelectedBook(book);
    setSelectedChapter(0);
    setBrowseView("chapters");
  };

  const selectChapter = (ch: number) => {
    setSelectedChapter(ch);
    setBrowseView("verses");
  };

  const goBack = () => {
    if (browseView === "verses") {
      setSelectedChapter(0);
      setBrowseView("chapters");
    } else if (browseView === "chapters") {
      setSelectedBook("");
      setBrowseView("books");
    }
  };

  const renderBooksView = () => (
    <div className="space-y-3">
      <div>
        <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5 px-1">Old Testament</h4>
        <div className="grid grid-cols-2 gap-0.5">
          {OT_BOOKS.map((book) => (
            <button
              key={book}
              onClick={() => selectBook(book)}
              className="flex items-center justify-between px-2 py-1.5 text-xs rounded hover:bg-secondary text-left group"
            >
              <span className="truncate">{book}</span>
              <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>
      </div>
      <div>
        <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5 px-1">New Testament</h4>
        <div className="grid grid-cols-2 gap-0.5">
          {NT_BOOKS.map((book) => (
            <button
              key={book}
              onClick={() => selectBook(book)}
              className="flex items-center justify-between px-2 py-1.5 text-xs rounded hover:bg-secondary text-left group"
            >
              <span className="truncate">{book}</span>
              <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderChaptersView = () => (
    <div>
      <button onClick={goBack} className="flex items-center gap-1 text-xs text-primary mb-2 hover:underline">
        <ChevronLeft className="w-3 h-3" /> All Books
      </button>
      <h4 className="text-sm font-semibold mb-2">{selectedBook}</h4>
      <div className="grid grid-cols-5 gap-1">
        {chapters.map((ch) => (
          <button
            key={ch}
            onClick={() => selectChapter(ch)}
            className="h-8 text-xs rounded bg-secondary hover:bg-accent hover:text-accent-foreground font-medium"
          >
            {ch}
          </button>
        ))}
      </div>
    </div>
  );

  const renderVersesView = () => (
    <div>
      <button onClick={goBack} className="flex items-center gap-1 text-xs text-primary mb-2 hover:underline">
        <ChevronLeft className="w-3 h-3" /> {selectedBook}
      </button>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold">{selectedBook} {selectedChapter}</h4>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 text-xs gap-1 text-primary"
          onClick={() => addScripture(selectedBook, selectedChapter, chapterVerses)}
        >
          <Plus className="w-3 h-3" /> Add All
        </Button>
      </div>
      <div className="space-y-1.5">
        {chapterVerses.map((v) => (
          <div
            key={v.verse}
            className="text-xs text-muted-foreground pl-2 border-l border-border hover:border-primary hover:text-foreground cursor-pointer transition-colors"
            onClick={() => addScripture(v.book_name, v.chapter, [v])}
          >
            <span className="text-foreground font-semibold">{v.verse}.</span> {v.text}
          </div>
        ))}
      </div>
    </div>
  );

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
        <TabsContent value="bible" className="flex-1 overflow-hidden mt-0">
          <ScrollArea className="h-full px-2 pb-2">
            {isSearching ? (
              Object.keys(groupedVerses).length === 0 ? (
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
              )
            ) : (
              browseView === "books" ? renderBooksView() :
              browseView === "chapters" ? renderChaptersView() :
              renderVersesView()
            )}
          </ScrollArea>
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
