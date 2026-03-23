export interface BibleVerse {
  book: string;
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

// Sample Bible verses (KJV) - a real app would have a full database
const sampleVerses: BibleVerse[] = [
  { book: "John", chapter: 3, verse: 16, text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life." },
  { book: "John", chapter: 3, verse: 17, text: "For God sent not his Son into the world to condemn the world; but that the world through him might be saved." },
  { book: "Psalm", chapter: 23, verse: 1, text: "The LORD is my shepherd; I shall not want." },
  { book: "Psalm", chapter: 23, verse: 2, text: "He maketh me to lie down in green pastures: he leadeth me beside the still waters." },
  { book: "Psalm", chapter: 23, verse: 3, text: "He restoreth my soul: he leadeth me in the paths of righteousness for his name's sake." },
  { book: "Psalm", chapter: 23, verse: 4, text: "Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me." },
  { book: "Psalm", chapter: 23, verse: 5, text: "Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over." },
  { book: "Psalm", chapter: 23, verse: 6, text: "Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the LORD for ever." },
  { book: "Romans", chapter: 8, verse: 28, text: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose." },
  { book: "Romans", chapter: 8, verse: 31, text: "What shall we then say to these things? If God be for us, who can be against us?" },
  { book: "Philippians", chapter: 4, verse: 13, text: "I can do all things through Christ which strengtheneth me." },
  { book: "Philippians", chapter: 4, verse: 6, text: "Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God." },
  { book: "Philippians", chapter: 4, verse: 7, text: "And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus." },
  { book: "Proverbs", chapter: 3, verse: 5, text: "Trust in the LORD with all thine heart; and lean not unto thine own understanding." },
  { book: "Proverbs", chapter: 3, verse: 6, text: "In all thy ways acknowledge him, and he shall direct thy paths." },
  { book: "Isaiah", chapter: 40, verse: 31, text: "But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint." },
  { book: "Jeremiah", chapter: 29, verse: 11, text: "For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end." },
  { book: "Matthew", chapter: 28, verse: 19, text: "Go ye therefore, and teach all nations, baptizing them in the name of the Father, and of the Son, and of the Holy Ghost." },
  { book: "Matthew", chapter: 28, verse: 20, text: "Teaching them to observe all things whatsoever I have commanded you: and, lo, I am with you always, even unto the end of the world. Amen." },
  { book: "Genesis", chapter: 1, verse: 1, text: "In the beginning God created the heaven and the earth." },
  { book: "Genesis", chapter: 1, verse: 2, text: "And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters." },
  { book: "Genesis", chapter: 1, verse: 3, text: "And God said, Let there be light: and there was light." },
  { book: "Revelation", chapter: 21, verse: 4, text: "And God shall wipe away all tears from their eyes; and there shall be no more death, neither sorrow, nor crying, neither shall there be any more pain: for the former things are passed away." },
  { book: "1 Corinthians", chapter: 13, verse: 4, text: "Charity suffereth long, and is kind; charity envieth not; charity vaunteth not itself, is not puffed up." },
  { book: "1 Corinthians", chapter: 13, verse: 13, text: "And now abideth faith, hope, charity, these three; but the greatest of these is charity." },
  { book: "Hebrews", chapter: 11, verse: 1, text: "Now faith is the substance of things hoped for, the evidence of things not seen." },
  { book: "Joshua", chapter: 1, verse: 9, text: "Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest." },
];

export function searchBibleVerses(query: string): BibleVerse[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return sampleVerses.filter(
    (v) =>
      v.text.toLowerCase().includes(q) ||
      v.book.toLowerCase().includes(q) ||
      `${v.book} ${v.chapter}:${v.verse}`.toLowerCase().includes(q)
  );
}

export function getVersesByReference(ref: BibleReference): BibleVerse[] {
  return sampleVerses.filter(
    (v) =>
      v.book.toLowerCase() === ref.book.toLowerCase() &&
      v.chapter === ref.chapter &&
      v.verse >= ref.verseStart &&
      v.verse <= (ref.verseEnd || ref.verseStart)
  );
}

export function getVerseDisplay(verse: BibleVerse): string {
  return `${verse.book} ${verse.chapter}:${verse.verse}`;
}

export function getAllBooks(): string[] {
  return [...new Set(sampleVerses.map((v) => v.book))].sort();
}

export { sampleVerses };
