export interface ScaleTheoryInfo {
  degrees: string;
  alsoKnownAs?: string;
  parentScale: string;
  example: string;
  flavor: string;
  pentatonicTip: string;
}

const scaleTheory: Record<string, ScaleTheoryInfo> = {
  ionian: {
    alsoKnownAs: "Major Scale",
    degrees: "1 2 3 4 5 6 7",
    parentScale:
      "This is the major scale (the reference point for all modes)",
    example:
      "C Ionian uses the same notes as C Major - it's the baseline",
    flavor:
      "Melodic, happy, and stable - the 'default' major sound (think Allman Brothers' 'Blue Sky')",
    pentatonicTip:
      "Major pentatonic works great in rock contexts over Ionian progressions",
  },
  dorian: {
    degrees: "1 2 ♭3 4 5 6 ♭7",
    parentScale: "Built from the 2nd degree of the major scale",
    example:
      "D Dorian uses the same notes as C Major, but think of the tonality as D, not C",
    flavor:
      "Smooth, jazzy minor - not sad, more cool and sophisticated (think Santana's 'Oye Como Va', Pink Floyd's 'Another Brick in the Wall')",
    pentatonicTip:
      "Because Dorian is minor-flavored, minor pentatonic also works well in a rock context",
  },
  phrygian: {
    degrees: "1 ♭2 ♭3 4 5 ♭6 ♭7",
    parentScale: "Built from the 3rd degree of the major scale",
    example:
      "E Phrygian uses the same notes as C Major, but think of the tonality as E, not C",
    flavor:
      "Dark, exotic, and Spanish/metal - that ♭2 gives it tension and edge (think Metallica's 'Wherever I May Roam', Jefferson Airplane's 'White Rabbit')",
    pentatonicTip:
      "Because Phrygian is minor-flavored, minor pentatonic also works well in a rock context",
  },
  lydian: {
    degrees: "1 2 3 ♯4 5 6 7",
    parentScale: "Built from the 4th degree of the major scale",
    example:
      "F Lydian uses the same notes as C Major, but think of the tonality as F, not C",
    flavor:
      "Dreamy, floaty, and spacey - major but with an otherworldly #4 (think Joe Satriani's 'Flying in a Blue Dream', The Simpsons theme)",
    pentatonicTip:
      "Because Lydian is major-flavored, major pentatonic works well in rock contexts over Lydian progressions",
  },
  mixolydian: {
    degrees: "1 2 3 4 5 6 ♭7",
    parentScale: "Built from the 5th degree of the major scale",
    example:
      "G Mixolydian uses the same notes as C Major, but think of the tonality as G, not C",
    flavor:
      "Major but with a tangy, bluesy ♭7 - can sound bright, but with a bit of mystery or edge (think Grateful Dead's 'Fire on the Mountain', Tom Verlaine's solo on Television's 'Marquee Moon')",
    pentatonicTip:
      "Because Mixolydian is major-flavored, major pentatonic works well in rock contexts over Mixolydian progressions",
  },
  aeolian: {
    alsoKnownAs: "Natural Minor Scale",
    degrees: "1 2 ♭3 4 5 ♭6 ♭7",
    parentScale: "Built from the 6th degree of the major scale",
    example:
      "A Aeolian uses the same notes as C Major, but think of the tonality as A, not C",
    flavor:
      "Sad, dark, and emotional - the 'default' minor sound (think R.E.M.'s 'Losing My Religion', Nirvana's 'Smells Like Teen Spirit')",
    pentatonicTip:
      "Because Aeolian is minor-flavored, minor pentatonic also works well in a rock context",
  },
  locrian: {
    degrees: "1 ♭2 ♭3 4 ♭5 ♭6 ♭7",
    parentScale: "Built from the 7th degree of the major scale",
    example:
      "B Locrian uses the same notes as C Major, but think of the tonality as B, not C",
    flavor:
      "Unstable and dissonant - rarely used for full songs due to the ♭5 diminished 5th (think Rush's 'YYZ' intro riff)",
    pentatonicTip:
      "Locrian is so unstable it's almost never used for full melodies - mostly just for metal riffs",
  },
  "major pentatonic": {
    degrees: "1 2 3 5 6",
    parentScale:
      "Subset of the major scale (removes 4th and 7th degrees)",
    example:
      "C Major Pentatonic uses C, D, E, G, A - a 'safe' 5-note major scale that avoids tension notes",
    flavor:
      "Bright, open, and universally useful - the go-to for rock, country, and blues soloing over major keys (think The Allman Brothers' 'Ramblin' Man')",
    pentatonicTip:
      "You learned the minor pentatonic, and one day you noticed that if you shifted 4 frets back, suddenly it sounded good over major chord progressions.",
  },
  "minor pentatonic": {
    degrees: "1 ♭3 4 5 ♭7",
    parentScale:
      "Subset of the natural minor (aeolian) scale (removes 2nd and 6th degrees)",
    example:
      "A Minor Pentatonic uses A, C, D, E, G - the most common scale shape for rock guitar soloing",
    flavor:
      "Raw, bluesy, and powerful - the backbone of rock and blues guitar (think Jimi Hendrix's 'Voodoo Child')",
    pentatonicTip:
      "For better or worse, the first scale most rock guitarists learn. Use minor pentatonic as an entry point to solo over almost any minor or blues progression",
  },
  "major blues": {
    degrees: "1 2 ♭3 3 5 6",
    parentScale:
      "Major pentatonic with an added ♭3 (the 'blue note')",
    example:
      "C Major Blues adds an E♭ passing tone to C major pentatonic, creating that signature bluesy bend",
    flavor:
      "Happy but gritty - major pentatonic with blues flavor from the ♭3 chromatic passing tone (think B.B. King's major-key licks, Eric Clapton's 'Wonderful Tonight')",
    pentatonicTip:
      "Use major pentatonic as the foundation and add the ♭3 as a 'bend-into' or passing tone for blues flavor",
  },
  "minor blues": {
    alsoKnownAs: "Blues Scale",
    degrees: "1 ♭3 4 ♭5 5 ♭7",
    parentScale:
      "Minor pentatonic with an added ♭5 (the 'blue note')",
    example:
      "A Minor Blues adds a D♯/E♭ to A minor pentatonic - the classic blues scale",
    flavor:
      "Dark, gritty, and expressive - the quintessential blues sound, the ♭5 adds that 'wrong-but-right' tension (think Stevie Ray Vaughan's 'Pride and Joy', Black Sabbath's 'Iron Man' riff)",
    pentatonicTip:
      "Use minor pentatonic as the foundation and add the ♭5 as a chromatic passing tone between 4 and 5",
  },
  "harmonic minor": {
    degrees: "1 2 ♭3 4 5 ♭6 7",
    parentScale:
      "Natural minor with a raised 7th degree",
    example:
      "A Harmonic Minor is like A Aeolian but with G♯ instead of G - creating a stronger pull to the tonic",
    flavor:
      "Dark and exotic with a classical/neoclassical edge - the raised 7th creates dramatic tension (think Ritchie Blackmore's 'Gates of Babylon', Yngwie Malmsteen's neoclassical runs)",
    pentatonicTip:
      "Minor pentatonic still works as a foundation, but add the natural 7th for harmonic minor color on the V chord",
  },
  "melodic minor": {
    degrees: "1 2 ♭3 4 5 6 7",
    parentScale:
      "Natural minor with raised 6th and 7th degrees (ascending form)",
    example:
      "A Melodic Minor is like A Aeolian but with F♯ and G♯ instead of F and G - smoothing out the melody ascending",
    flavor:
      "Sophisticated and smooth - a 'jazz minor' sound, less exotic than harmonic minor (think Pat Metheny, Larry Carlton's fusion lines)",
    pentatonicTip:
      "Minor pentatonic works as a starting point, but the raised 6th and 7th give it a distinctly jazzy-minor sound",
  },
};

export default scaleTheory;
