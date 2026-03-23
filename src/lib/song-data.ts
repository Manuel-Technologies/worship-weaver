export interface Song {
  id: string;
  title: string;
  author: string;
  ccli?: string;
  sections: SongSection[];
}

export interface SongSection {
  type: "verse" | "chorus" | "bridge" | "pre-chorus" | "tag" | "intro" | "outro";
  label: string;
  lines: string[];
}

const sampleSongs: Song[] = [
  {
    id: "1",
    title: "Amazing Grace",
    author: "John Newton",
    ccli: "4755360",
    sections: [
      { type: "verse", label: "Verse 1", lines: ["Amazing grace how sweet the sound", "That saved a wretch like me", "I once was lost but now am found", "Was blind but now I see"] },
      { type: "verse", label: "Verse 2", lines: ["'Twas grace that taught my heart to fear", "And grace my fears relieved", "How precious did that grace appear", "The hour I first believed"] },
      { type: "verse", label: "Verse 3", lines: ["Through many dangers toils and snares", "I have already come", "'Tis grace hath brought me safe thus far", "And grace will lead me home"] },
      { type: "verse", label: "Verse 4", lines: ["When we've been there ten thousand years", "Bright shining as the sun", "We've no less days to sing God's praise", "Than when we first begun"] },
    ],
  },
  {
    id: "2",
    title: "How Great Is Our God",
    author: "Chris Tomlin, Jesse Reeves, Ed Cash",
    ccli: "4348399",
    sections: [
      { type: "verse", label: "Verse 1", lines: ["The splendor of the King", "Clothed in majesty", "Let all the earth rejoice", "All the earth rejoice"] },
      { type: "verse", label: "Verse 1 (cont)", lines: ["He wraps Himself in light", "And darkness tries to hide", "And trembles at His voice", "And trembles at His voice"] },
      { type: "chorus", label: "Chorus", lines: ["How great is our God", "Sing with me", "How great is our God", "And all will see how great", "How great is our God"] },
      { type: "verse", label: "Verse 2", lines: ["And age to age He stands", "And time is in His hands", "Beginning and the End", "Beginning and the End"] },
      { type: "bridge", label: "Bridge", lines: ["Name above all names", "Worthy of all praise", "My heart will sing", "How great is our God"] },
    ],
  },
  {
    id: "3",
    title: "10,000 Reasons (Bless the Lord)",
    author: "Matt Redman, Jonas Myrin",
    ccli: "6016351",
    sections: [
      { type: "chorus", label: "Chorus", lines: ["Bless the Lord O my soul", "O my soul", "Worship His holy name", "Sing like never before", "O my soul", "I'll worship Your holy name"] },
      { type: "verse", label: "Verse 1", lines: ["The sun comes up it's a new day dawning", "It's time to sing Your song again", "Whatever may pass and whatever lies before me", "Let me be singing when the evening comes"] },
      { type: "verse", label: "Verse 2", lines: ["You're rich in love and You're slow to anger", "Your name is great and Your heart is kind", "For all Your goodness I will keep on singing", "Ten thousand reasons for my heart to find"] },
    ],
  },
  {
    id: "4",
    title: "Great Are You Lord",
    author: "David Leonard, Jason Ingram, Leslie Jordan",
    ccli: "6460220",
    sections: [
      { type: "verse", label: "Verse", lines: ["You give life You are love", "You bring light to the darkness", "You give hope You restore", "Every heart that is broken"] },
      { type: "chorus", label: "Chorus", lines: ["Great are You Lord", "It's Your breath in our lungs", "So we pour out our praise", "We pour out our praise"] },
      { type: "bridge", label: "Bridge", lines: ["All the earth will shout Your praise", "Our hearts will cry these bones will sing", "Great are You Lord"] },
    ],
  },
  {
    id: "5",
    title: "What A Beautiful Name",
    author: "Ben Fielding, Brooke Ligertwood",
    ccli: "7068424",
    sections: [
      { type: "verse", label: "Verse 1", lines: ["You were the Word at the beginning", "One with God the Lord Most High", "Your hidden glory in creation", "Now revealed in You our Christ"] },
      { type: "chorus", label: "Chorus 1", lines: ["What a beautiful Name it is", "What a beautiful Name it is", "The Name of Jesus Christ my King", "What a beautiful Name it is", "Nothing compares to this", "What a beautiful Name it is", "The Name of Jesus"] },
      { type: "verse", label: "Verse 2", lines: ["You didn't want heaven without us", "So Jesus You brought heaven down", "My sin was great Your love was greater", "What could separate us now"] },
    ],
  },
];

export function searchSongs(query: string): Song[] {
  const q = query.toLowerCase().trim();
  if (!q) return sampleSongs;
  return sampleSongs.filter(
    (s) =>
      s.title.toLowerCase().includes(q) ||
      s.author.toLowerCase().includes(q) ||
      s.sections.some((sec) => sec.lines.some((l) => l.toLowerCase().includes(q)))
  );
}

export function getSongById(id: string): Song | undefined {
  return sampleSongs.find((s) => s.id === id);
}

export { sampleSongs };
