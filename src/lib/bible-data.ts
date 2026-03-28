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

const DB_NAME = "ambopro-bible";
const DB_VERSION = 1;
const STORE_NAME = "verses";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getCachedVerses(): Promise<BibleVerse[] | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get("kjv");
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

async function setCachedVerses(verses: BibleVerse[]): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(verses, "kjv");
  } catch {
    // silent fail — cache is optional
  }
}

function parseVerses(data: any): BibleVerse[] {
  return data.verses.map((v: any) => ({
    book_name: v.book_name,
    book: v.book,
    chapter: v.chapter,
    verse: v.verse,
    text: v.text.replace(/^¶\s*/, ""),
  }));
}

export async function loadBible(): Promise<BibleVerse[]> {
  if (versesCache) return versesCache;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    // Try IndexedDB cache first (instant, works offline)
    const cached = await getCachedVerses();
    if (cached && cached.length > 0) {
      versesCache = cached;
      return versesCache;
    }

    // Fetch from network
    const res = await fetch("/kjv.json");
    const data = await res.json();
    versesCache = parseVerses(data);

    // Cache for next time (fire and forget)
    setCachedVerses(versesCache);

    return versesCache;
  })();

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

export function getChaptersForBook(bookName: string): number[] {
  const verses = getLoadedVerses();
  const chapters = new Set<number>();
  for (const v of verses) {
    if (v.book_name.toLowerCase() === bookName.toLowerCase()) {
      chapters.add(v.chapter);
    }
  }
  return [...chapters].sort((a, b) => a - b);
}

export function getVersesForChapter(bookName: string, chapter: number): BibleVerse[] {
  const verses = getLoadedVerses();
  return verses.filter(
    (v) => v.book_name.toLowerCase() === bookName.toLowerCase() && v.chapter === chapter
  );
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
  "1 sam": "1 Samuel", "1 samuel": "1 Samuel", "first samuel": "1 Samuel", "1st samuel": "1 Samuel",
  "2 sam": "2 Samuel", "2 samuel": "2 Samuel", "second samuel": "2 Samuel", "2nd samuel": "2 Samuel",
  "1 kings": "1 Kings", "first kings": "1 Kings", "1st kings": "1 Kings",
  "2 kings": "2 Kings", "second kings": "2 Kings", "2nd kings": "2 Kings",
  "1 chron": "1 Chronicles", "1 chronicles": "1 Chronicles", "first chronicles": "1 Chronicles", "1st chronicles": "1 Chronicles",
  "2 chron": "2 Chronicles", "2 chronicles": "2 Chronicles", "second chronicles": "2 Chronicles", "2nd chronicles": "2 Chronicles",
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
  "1 cor": "1 Corinthians", "1 corinthians": "1 Corinthians", "first corinthians": "1 Corinthians", "1st corinthians": "1 Corinthians",
  "2 cor": "2 Corinthians", "2 corinthians": "2 Corinthians", "second corinthians": "2 Corinthians", "2nd corinthians": "2 Corinthians",
  "gal": "Galatians", "galatians": "Galatians",
  "eph": "Ephesians", "ephesians": "Ephesians",
  "phil": "Philippians", "philippians": "Philippians",
  "col": "Colossians", "colossians": "Colossians",
  "1 thess": "1 Thessalonians", "1 thessalonians": "1 Thessalonians", "first thessalonians": "1 Thessalonians", "1st thessalonians": "1 Thessalonians",
  "2 thess": "2 Thessalonians", "2 thessalonians": "2 Thessalonians", "second thessalonians": "2 Thessalonians", "2nd thessalonians": "2 Thessalonians",
  "1 tim": "1 Timothy", "1 timothy": "1 Timothy", "first timothy": "1 Timothy", "1st timothy": "1 Timothy",
  "2 tim": "2 Timothy", "2 timothy": "2 Timothy", "second timothy": "2 Timothy", "2nd timothy": "2 Timothy",
  "titus": "Titus",
  "philem": "Philemon", "philemon": "Philemon",
  "heb": "Hebrews", "hebrews": "Hebrews",
  "james": "James",
  "1 pet": "1 Peter", "1 peter": "1 Peter", "first peter": "1 Peter", "1st peter": "1 Peter",
  "2 pet": "2 Peter", "2 peter": "2 Peter", "second peter": "2 Peter", "2nd peter": "2 Peter",
  "1 john": "1 John", "first john": "1 John", "1st john": "1 John",
  "2 john": "2 John", "second john": "2 John", "2nd john": "2 John",
  "3 john": "3 John", "third john": "3 John", "3rd john": "3 John",
  "jude": "Jude",
  "rev": "Revelation", "revelation": "Revelation", "revelations": "Revelation",
};

// Spoken number words → digits
const SPOKEN_NUMBERS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17,
  eighteen: 18, nineteen: 19, twenty: 20, "twenty one": 21, "twenty two": 22, "twenty three": 23,
  "twenty four": 24, "twenty five": 25, "twenty six": 26, "twenty seven": 27, "twenty eight": 28,
  "twenty nine": 29, thirty: 30, "thirty one": 31, "thirty two": 32, "thirty three": 33,
  "thirty four": 34, "thirty five": 35, "thirty six": 36, forty: 40, fifty: 50,
  "forty one": 41, "forty two": 42, "forty three": 43, "forty four": 44, "forty five": 45,
  "forty six": 46, "forty seven": 47, "forty eight": 48, "forty nine": 49,
  "fifty one": 51, "fifty two": 52, "fifty three": 53, "fifty four": 54, "fifty five": 55,
  "sixty": 60, "seventy": 70, "eighty": 80, "ninety": 90, "hundred": 100,
  "one hundred": 100, "one hundred and one": 101, "one hundred and fifty": 150,
};

/**
 * Replace spoken number words with digits in text.
 */
function spokenNumbersToDigits(text: string): string {
  let result = text;
  // Sort by length descending so "twenty one" matches before "twenty"
  const sorted = Object.keys(SPOKEN_NUMBERS).sort((a, b) => b.length - a.length);
  for (const word of sorted) {
    const re = new RegExp(`\\b${word}\\b`, "gi");
    result = result.replace(re, String(SPOKEN_NUMBERS[word]));
  }
  return result;
}

/**
 * Normalize ordinal prefixes in text for better speech recognition matching.
 * Converts "1st" → "1", "2nd" → "2", "3rd" → "3" and word ordinals.
 */
function normalizeOrdinals(text: string): string {
  return text
    .replace(/\b1st\b/gi, "1")
    .replace(/\b2nd\b/gi, "2")
    .replace(/\b3rd\b/gi, "3")
    .replace(/\bfirst\b/gi, "1")
    .replace(/\bsecond\b/gi, "2")
    .replace(/\bthird\b/gi, "3");
}

/**
 * Normalize speech artifacts and filler patterns.
 */
function normalizeSpeech(text: string): string {
  return text
    // Remove common filler/cue words
    .replace(/\b(?:the\s+book\s+of|the\s+gospel\s+(?:of|according\s+to)|the\s+epistle\s+(?:of|to)|the\s+letter\s+(?:of|to))\s+/gi, "")
    // "chapter X and verse Y" → "chapter X verse Y"
    .replace(/\bchapter\s+(\d+)\s+and\s+verse/gi, "chapter $1 verse")
    // "verses X and Y" → "verses X to Y" (for ranges)
    .replace(/\bverse[s]?\s+(\d+)\s+and\s+(\d+)/gi, "verses $1 to $2")
    // "from verse X to Y" → "verses X to Y"
    .replace(/\bfrom\s+verse\s+/gi, "verses ")
    // "reading from" → ""
    .replace(/\breading\s+from\s+/gi, "")
    // Remove "says" or "said" after reference context
    .replace(/\b(?:says?|said)\s+/gi, "")
    .trim();
}

/**
 * Parse a spoken or typed Bible reference string.
 * Handles patterns like "John 3:16", "first corinthians 13 verse 4",
 * "Psalm 23 verses 1 through 6", "John chapter three verse sixteen"
 */
export function parseBibleReference(text: string): BibleReference | null {
  let t = text.toLowerCase().trim();

  const patterns = [
    // "John 3:16-18"
    /^(.+?)\s+(\d+)\s*:\s*(\d+)\s*[-–to]+\s*(\d+)/,
    // "John 3:16"
    /^(.+?)\s+(\d+)\s*:\s*(\d+)/,
    // "John chapter 3 verses 16 through 18"
    /^(.+?)\s+(?:chapter\s+)?(\d+)\s+verse[s]?\s+(\d+)\s+(?:through|to|thru|[-–])\s+(\d+)/,
    // "John chapter 3 verse 16"
    /^(.+?)\s+(?:chapter\s+)?(\d+)\s+verse[s]?\s+(\d+)/,
    // "John chapter 3 from 16 to 18"
    /^(.+?)\s+(?:chapter\s+)?(\d+)\s+(?:from\s+)?(\d+)\s+(?:to|through|thru|[-–])\s+(\d+)/,
    // "John 3" (chapter only)
    /^(.+?)\s+(?:chapter\s+)?(\d+)$/,
  ];

  // Build variants: original, ordinal-normalized, spoken-numbers-replaced, both
  const v1 = t;
  const v2 = normalizeOrdinals(t);
  const v3 = spokenNumbersToDigits(t);
  const v4 = spokenNumbersToDigits(normalizeOrdinals(t));
  const v5 = normalizeSpeech(v1);
  const v6 = normalizeSpeech(v4);
  const variants = [...new Set([v1, v2, v3, v4, v5, v6])];

  for (const variant of variants) {
    for (const pat of patterns) {
      const m = variant.match(pat);
      if (!m) continue;
      const bookRaw = m[1].trim();
      const chapter = parseInt(m[2]);
      const verseStart = m[3] ? parseInt(m[3]) : 1;
      const verseEnd = m[4] ? parseInt(m[4]) : undefined;

      // Try alias lookups with various normalizations
      const bookCandidates = [
        bookRaw,
        normalizeOrdinals(bookRaw).replace(/^(\d)\s+/, "$1 "),
        bookRaw.replace(/^the\s+/, ""),
        normalizeSpeech(bookRaw),
      ];
      let bookName: string | undefined;
      for (const candidate of bookCandidates) {
        if (BOOK_ALIASES[candidate]) {
          bookName = BOOK_ALIASES[candidate];
          break;
        }
      }
      if (!bookName) continue;

      return { book: bookName, chapter, verseStart, verseEnd };
    }
  }
  return null;
}

// All book names for building dynamic regex
const ALL_BOOK_NAMES = [
  "genesis", "exodus", "leviticus", "numbers", "deuteronomy",
  "joshua", "judges", "ruth",
  "(?:1|2|1st|2nd|first|second)\\s*samuel",
  "(?:1|2|1st|2nd|first|second)\\s*kings",
  "(?:1|2|1st|2nd|first|second)\\s*chronicles",
  "ezra", "nehemiah", "esther", "job", "psalms?",
  "proverbs", "ecclesiastes", "song\\s+of\\s+solomon",
  "isaiah", "jeremiah", "lamentations", "ezekiel", "daniel",
  "hosea", "joel", "amos", "obadiah", "jonah", "micah",
  "nahum", "habakkuk", "zephaniah", "haggai", "zechariah", "malachi",
  "matthew", "mark", "luke", "john", "acts", "romans",
  "(?:1|2|1st|2nd|first|second)\\s*corinthians",
  "galatians", "ephesians", "philippians", "colossians",
  "(?:1|2|1st|2nd|first|second)\\s*thessalonians",
  "(?:1|2|1st|2nd|first|second)\\s*timothy",
  "titus", "philemon", "hebrews", "james",
  "(?:1|2|1st|2nd|first|second)\\s*peter",
  "(?:1|2|3|1st|2nd|3rd|first|second|third)\\s*john",
  "jude", "revelations?",
];

const BOOK_PATTERN = ALL_BOOK_NAMES.join("|");

/**
 * Detect Bible references in transcribed speech text.
 * Handles explicit mentions, cue phrases, and various spoken formats.
 */
export function detectReferencesInText(text: string): BibleReference[] {
  const refs: BibleReference[] = [];
  const seen = new Set<string>();

  // Normalize the input
  let t = text.toLowerCase();
  // Pre-process: convert spoken numbers in verse/chapter positions
  const tNorm = spokenNumbersToDigits(normalizeOrdinals(normalizeSpeech(t)));

  // Multiple detection strategies
  const allTexts = [...new Set([t, tNorm])];

  for (const input of allTexts) {
    const cuePatterns = [
      // Cue phrases: "turn to John 3:16", "let's read Psalm 23", "we find in Romans 8:28"
      /(?:turn\s+to|go\s+to|let'?s?\s+(?:read|look\s+at|open)|open\s+(?:your\s+)?(?:bibles?\s+to)?|look\s+at|read(?:ing)?\s+(?:from)?|(?:we\s+)?(?:find|see|read)\s+(?:it\s+)?in|it\s+says?\s+in|according\s+to|written\s+in|(?:the\s+)?book\s+of|(?:the\s+)?gospel\s+(?:of|according\s+to)|as\s+(?:recorded|written)\s+in)\s+(.+?)(?:\.|,|;|!|\?|$)/gi,
      // Direct reference: "John 3:16", "1 Kings 19:12", "Psalm 23 verse 1"
      new RegExp(
        `(\\b(?:${BOOK_PATTERN})\\s+(?:chapter\\s+)?\\d+(?:\\s*:\\s*\\d+(?:\\s*[-–]\\s*\\d+)?|\\s+verse[s]?\\s+\\d+(?:\\s+(?:through|to|thru|[-–])\\s+\\d+)?)?)`,
        "gi"
      ),
      // Chapter-only: "John 3", "Psalm 23"
      new RegExp(
        `(\\b(?:${BOOK_PATTERN})\\s+(?:chapter\\s+)?\\d+)\\b`,
        "gi"
      ),
    ];

    for (const pat of cuePatterns) {
      let match;
      while ((match = pat.exec(input)) !== null) {
        const raw = match[1] || match[0];
        const ref = parseBibleReference(raw);
        if (ref) {
          const key = `${ref.book}:${ref.chapter}:${ref.verseStart}`;
          if (!seen.has(key)) {
            seen.add(key);
            refs.push(ref);
          }
        }
      }
    }
  }

  return refs;
}
