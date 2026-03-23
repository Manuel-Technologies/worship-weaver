export interface BibleVerse {
  book_name: string;
  book: number;
  chapter: number;
  verse: number;
  text: string;
}

export interface BibleReference {
  book: string;
  chapter: number;
  verseStart: number;
  verseEnd?: number;
}

let versesCache: BibleVerse[] | null = null;
let loadingPromise: Promise<BibleVerse[]> | null = null;

export async function loadBible(): Promise<BibleVerse[]> {
  if (versesCache) return versesCache;
  if (loadingPromise) return loadingPromise;

  loadingPromise = fetch("/kjv.json")
    .then((r) => r.json())
    .then((data) => {
      versesCache = data.verses.map((v: any) => ({
        book_name: v.book_name,
        book: v.book,
        chapter: v.chapter,
        verse: v.verse,
        text: v.text.replace(/^¶\s*/, ""), // strip pilcrow marks
      }));
      return versesCache!;
    });

  return loadingPromise;
}

export function getLoadedVerses(): BibleVerse[] {
  return versesCache || [];
}

export function getVersesByReference(ref: BibleReference): BibleVerse[] {
  const verses = getLoadedVerses();
  const bookLower = ref.book.toLowerCase();
  return verses.filter(
    (v) =>
      v.book_name.toLowerCase() === bookLower &&
      v.chapter === ref.chapter &&
      v.verse >= ref.verseStart &&
      v.verse <= (ref.verseEnd || ref.verseStart)
  );
}

export function searchBibleVerses(query: string): BibleVerse[] {
  const q = query.toLowerCase().trim();
  if (!q || q.length < 2) return [];
  const verses = getLoadedVerses();
  const results: BibleVerse[] = [];
  for (const v of verses) {
    if (results.length >= 50) break; // limit results
    if (
      v.text.toLowerCase().includes(q) ||
      v.book_name.toLowerCase().includes(q) ||
      `${v.book_name} ${v.chapter}:${v.verse}`.toLowerCase().includes(q)
    ) {
      results.push(v);
    }
  }
  return results;
}

export function getVerseDisplay(verse: BibleVerse): string {
  return `${verse.book_name} ${verse.chapter}:${verse.verse}`;
}

export function getAllBooks(): string[] {
  const verses = getLoadedVerses();
  return [...new Set(verses.map((v) => v.book_name))];
}

// Book name aliases for speech recognition matching
const BOOK_ALIASES: Record<string, string> = {
  "gen": "Genesis", "genesis": "Genesis",
  "ex": "Exodus", "exod": "Exodus", "exodus": "Exodus",
  "lev": "Leviticus", "leviticus": "Leviticus",
  "num": "Numbers", "numbers": "Numbers",
  "deut": "Deuteronomy", "deuteronomy": "Deuteronomy",
  "josh": "Joshua", "joshua": "Joshua",
  "judg": "Judges", "judges": "Judges",
  "ruth": "Ruth",
  "1 sam": "1 Samuel", "1 samuel": "1 Samuel", "first samuel": "1 Samuel",
  "2 sam": "2 Samuel", "2 samuel": "2 Samuel", "second samuel": "2 Samuel",
  "1 kings": "1 Kings", "first kings": "1 Kings",
  "2 kings": "2 Kings", "second kings": "2 Kings",
  "1 chron": "1 Chronicles", "1 chronicles": "1 Chronicles", "first chronicles": "1 Chronicles",
  "2 chron": "2 Chronicles", "2 chronicles": "2 Chronicles", "second chronicles": "2 Chronicles",
  "ezra": "Ezra",
  "neh": "Nehemiah", "nehemiah": "Nehemiah",
  "esth": "Esther", "esther": "Esther",
  "job": "Job",
  "ps": "Psalms", "psalm": "Psalms", "psalms": "Psalms",
  "prov": "Proverbs", "proverbs": "Proverbs",
  "eccl": "Ecclesiastes", "ecclesiastes": "Ecclesiastes",
  "song": "Song of Solomon", "song of solomon": "Song of Solomon",
  "isa": "Isaiah", "isaiah": "Isaiah",
  "jer": "Jeremiah", "jeremiah": "Jeremiah",
  "lam": "Lamentations", "lamentations": "Lamentations",
  "ezek": "Ezekiel", "ezekiel": "Ezekiel",
  "dan": "Daniel", "daniel": "Daniel",
  "hos": "Hosea", "hosea": "Hosea",
  "joel": "Joel",
  "amos": "Amos",
  "obad": "Obadiah", "obadiah": "Obadiah",
  "jonah": "Jonah",
  "mic": "Micah", "micah": "Micah",
  "nah": "Nahum", "nahum": "Nahum",
  "hab": "Habakkuk", "habakkuk": "Habakkuk",
  "zeph": "Zephaniah", "zephaniah": "Zephaniah",
  "hag": "Haggai", "haggai": "Haggai",
  "zech": "Zechariah", "zechariah": "Zechariah",
  "mal": "Malachi", "malachi": "Malachi",
  "matt": "Matthew", "matthew": "Matthew",
  "mark": "Mark",
  "luke": "Luke",
  "john": "John",
  "acts": "Acts",
  "rom": "Romans", "romans": "Romans",
  "1 cor": "1 Corinthians", "1 corinthians": "1 Corinthians", "first corinthians": "1 Corinthians",
  "2 cor": "2 Corinthians", "2 corinthians": "2 Corinthians", "second corinthians": "2 Corinthians",
  "gal": "Galatians", "galatians": "Galatians",
  "eph": "Ephesians", "ephesians": "Ephesians",
  "phil": "Philippians", "philippians": "Philippians",
  "col": "Colossians", "colossians": "Colossians",
  "1 thess": "1 Thessalonians", "1 thessalonians": "1 Thessalonians", "first thessalonians": "1 Thessalonians",
  "2 thess": "2 Thessalonians", "2 thessalonians": "2 Thessalonians", "second thessalonians": "2 Thessalonians",
  "1 tim": "1 Timothy", "1 timothy": "1 Timothy", "first timothy": "1 Timothy",
  "2 tim": "2 Timothy", "2 timothy": "2 Timothy", "second timothy": "2 Timothy",
  "titus": "Titus",
  "philem": "Philemon", "philemon": "Philemon",
  "heb": "Hebrews", "hebrews": "Hebrews",
  "james": "James",
  "1 pet": "1 Peter", "1 peter": "1 Peter", "first peter": "1 Peter",
  "2 pet": "2 Peter", "2 peter": "2 Peter", "second peter": "2 Peter",
  "1 john": "1 John", "first john": "1 John",
  "2 john": "2 John", "second john": "2 John",
  "3 john": "3 John", "third john": "3 John",
  "jude": "Jude",
  "rev": "Revelation", "revelation": "Revelation", "revelations": "Revelation",
};

/**
 * Parse a spoken or typed Bible reference string.
 * Handles patterns like "John 3:16", "first corinthians 13 verse 4", "Psalm 23 verses 1 through 6"
 */
export function parseBibleReference(text: string): BibleReference | null {
  const t = text.toLowerCase().trim();

  // Pattern: "book chapter:verseStart-verseEnd" or "book chapter verse X" or "book chapter:verse"
  // Also handle spoken: "book chapter verse X through Y"
  const patterns = [
    // "john 3:16-18" or "john 3:16"
    /^(.+?)\s+(\d+)\s*:\s*(\d+)\s*[-–to]+\s*(\d+)/,
    /^(.+?)\s+(\d+)\s*:\s*(\d+)/,
    // "john chapter 3 verse 16 through 18"
    /^(.+?)\s+(?:chapter\s+)?(\d+)\s+verse[s]?\s+(\d+)\s+(?:through|to|thru|-)\s+(\d+)/,
    // "john chapter 3 verse 16"
    /^(.+?)\s+(?:chapter\s+)?(\d+)\s+verse[s]?\s+(\d+)/,
    // "john 3" (whole chapter)
    /^(.+?)\s+(\d+)$/,
  ];

  for (const pat of patterns) {
    const m = t.match(pat);
    if (!m) continue;
    const bookRaw = m[1].trim();
    const chapter = parseInt(m[2]);
    const verseStart = m[3] ? parseInt(m[3]) : 1;
    const verseEnd = m[4] ? parseInt(m[4]) : undefined;

    // Resolve book name
    const bookName = BOOK_ALIASES[bookRaw];
    if (!bookName) continue;

    return { book: bookName, chapter, verseStart, verseEnd };
  }
  return null;
}

/**
 * Detect Bible references in transcribed speech text.
 * Returns all references found in the text.
 */
export function detectReferencesInText(text: string): BibleReference[] {
  const refs: BibleReference[] = [];
  const t = text.toLowerCase();

  // Try to find patterns like "turn to John 3:16" or "let's read Psalm 23"
  const cuePatterns = [
    /(?:turn\s+to|go\s+to|let'?s?\s+read|open\s+(?:your\s+)?(?:bibles?\s+to)?|look\s+at|read(?:ing)?\s+from|in)\s+(.+?)(?:\.|,|$)/gi,
    // Direct reference pattern
    /(\b(?:genesis|exodus|leviticus|numbers|deuteronomy|joshua|judges|ruth|1\s*samuel|2\s*samuel|1\s*kings|2\s*kings|1\s*chronicles|2\s*chronicles|ezra|nehemiah|esther|job|psalms?|proverbs|ecclesiastes|song\s+of\s+solomon|isaiah|jeremiah|lamentations|ezekiel|daniel|hosea|joel|amos|obadiah|jonah|micah|nahum|habakkuk|zephaniah|haggai|zechariah|malachi|matthew|mark|luke|john|acts|romans|1\s*corinthians|2\s*corinthians|galatians|ephesians|philippians|colossians|1\s*thessalonians|2\s*thessalonians|1\s*timothy|2\s*timothy|titus|philemon|hebrews|james|1\s*peter|2\s*peter|1\s*john|2\s*john|3\s*john|jude|revelations?|first\s+\w+|second\s+\w+|third\s+\w+)\s+\d+(?:\s*:\s*\d+(?:\s*[-–to]+\s*\d+)?)?)/gi,
  ];

  for (const pat of cuePatterns) {
    let match;
    while ((match = pat.exec(t)) !== null) {
      const ref = parseBibleReference(match[1] || match[0]);
      if (ref) refs.push(ref);
    }
  }

  return refs;
}
