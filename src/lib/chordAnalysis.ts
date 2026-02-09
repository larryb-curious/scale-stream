import { Chord, Scale, Note } from "tonal";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ParsedChord {
  input: string;
  valid: boolean;
  tonic: string;
  notes: string[];
  quality: string; // "Major" | "Minor" | "Augmented" | "Diminished" | "Unknown"
  type: string; // chord type name, e.g. "major", "diminished", "dominant seventh"
}

export interface ScaleRecommendation {
  displayName: string; // "A Aeolian (Natural Minor)"
  scaleType: string; // "aeolian" – key into scaleTheory
  tonic: string; // "A"
  coverage: number; // 0–1 fraction of input notes covered
}

export type AnalysisResult = ScaleRecommendation[] | null;

// ---------------------------------------------------------------------------
// Whitelist of guitarist-relevant scales
// ---------------------------------------------------------------------------

interface WhitelistEntry {
  tonalName: string; // canonical tonal name, e.g. "major"
  scaleType: string; // our lookup key, e.g. "ionian"
  displaySuffix: string; // appended after tonic
  tier: number; // 1 = modes, 2 = pentatonic, 3 = harm/mel minor, 4 = blues
  family: "major" | "minor";
}

const WHITELIST: WhitelistEntry[] = [
  // 7 diatonic modes
  { tonalName: "major", scaleType: "ionian", displaySuffix: "Ionian (Major Scale)", tier: 1, family: "major" },
  { tonalName: "dorian", scaleType: "dorian", displaySuffix: "Dorian", tier: 1, family: "minor" },
  { tonalName: "phrygian", scaleType: "phrygian", displaySuffix: "Phrygian", tier: 1, family: "minor" },
  { tonalName: "lydian", scaleType: "lydian", displaySuffix: "Lydian", tier: 1, family: "major" },
  { tonalName: "mixolydian", scaleType: "mixolydian", displaySuffix: "Mixolydian", tier: 1, family: "major" },
  { tonalName: "minor", scaleType: "aeolian", displaySuffix: "Aeolian (Natural Minor)", tier: 1, family: "minor" },
  { tonalName: "locrian", scaleType: "locrian", displaySuffix: "Locrian", tier: 1, family: "minor" },
  // Pentatonic
  { tonalName: "major pentatonic", scaleType: "major pentatonic", displaySuffix: "Major Pentatonic", tier: 2, family: "major" },
  { tonalName: "minor pentatonic", scaleType: "minor pentatonic", displaySuffix: "Minor Pentatonic", tier: 2, family: "minor" },
  // Harmonic & melodic minor
  { tonalName: "harmonic minor", scaleType: "harmonic minor", displaySuffix: "Harmonic Minor", tier: 3, family: "minor" },
  { tonalName: "melodic minor", scaleType: "melodic minor", displaySuffix: "Melodic Minor", tier: 3, family: "minor" },
  // Blues
  { tonalName: "major blues", scaleType: "major blues", displaySuffix: "Major Blues", tier: 4, family: "major" },
  { tonalName: "minor blues", scaleType: "minor blues", displaySuffix: "Minor Blues", tier: 4, family: "minor" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function noteSetToChromaSet(notes: string[]): Set<number> {
  const s = new Set<number>();
  for (const n of notes) {
    const c = Note.chroma(n);
    if (c !== undefined) s.add(c);
  }
  return s;
}

/** Canonical pitch-class-set key for deduplication (absolute, not root-relative). */
function pitchClassSetKey(notes: string[]): string {
  return Array.from(noteSetToChromaSet(notes)).sort((a, b) => a - b).join(",");
}

function parseChords(input: string): ParsedChord[] {
  return input
    .trim()
    .split(/[\s,]+/)
    .filter((t) => t.length > 0)
    .map((token) => {
      const chord = Chord.get(token);
      return {
        input: token,
        valid: !chord.empty,
        tonic: chord.tonic ?? "",
        notes: chord.notes,
        quality: chord.quality,
        type: chord.type ?? "",
      };
    });
}

function mergeNotes(chords: ParsedChord[]): string[] {
  const noteSet = new Set<string>();
  for (const chord of chords) {
    if (chord.valid) {
      for (const note of chord.notes) noteSet.add(note);
    }
  }
  return Array.from(noteSet);
}

/**
 * Detects tonic by analyzing harmonic relationships between chords.
 * Returns the inferred key even if it's not present in the progression.
 */
function detectTonicFromHarmony(chords: ParsedChord[]): string | null {
  const validChords = chords.filter((c) => c.valid && c.tonic);
  if (validChords.length === 0) return null;

  // Collect all chord roots and qualities
  const progression = validChords.map(c => ({
    root: c.tonic,
    quality: c.quality || '',
    type: c.type || ''
  }));

  // Check if this looks like a blues progression (multiple dom7s)
  // In blues, the first dom7 IS the tonic (I7), not a V7 pointer
  const dom7Chords = progression.filter(c =>
    c.type === 'dominant seventh'
  );
  if (dom7Chords.length >= 2) {
    return dom7Chords[0].root;
  }

  // Strategy 1: Look for diminished chords (viio → key is half-step up)
  for (const chord of progression) {
    if (chord.quality === 'Diminished' || chord.type === 'diminished') {
      // F#dim suggests G major, Bdim suggests C major, etc.
      const keyNote = Note.transpose(chord.root, '2m'); // half-step up
      return keyNote;
    }
  }

  // Strategy 2: Look for a single dominant 7th chord (V7 → key is fifth down)
  for (const chord of progression) {
    if (chord.type === 'dominant seventh') {
      // D7 suggests G major, G7 suggests C major
      const keyNote = Note.transpose(chord.root, '-5P'); // fifth down
      return keyNote;
    }
  }

  // Strategy 3: Analyze chord relationships (circle of fifths, common patterns)
  // Check if progression fits common patterns in a potential key
  const potentialKeys = new Set<string>();

  // For each chord, check what keys it could be diatonic to
  for (const chord of progression) {
    const root = chord.root;
    // Common positions this chord might occupy: I, ii, iii, IV, V, vi
    potentialKeys.add(root); // Could be I
    potentialKeys.add(Note.transpose(root, '2M')); // Could be vii
    potentialKeys.add(Note.transpose(root, '-2M')); // Could be ii
    potentialKeys.add(Note.transpose(root, '3M')); // Could be vi
    potentialKeys.add(Note.transpose(root, '-3M')); // Could be iii
    potentialKeys.add(Note.transpose(root, '4P')); // Could be V
    potentialKeys.add(Note.transpose(root, '-4P')); // Could be IV
  }

  // Score each potential key by how many chords fit diatonically
  const keyScores = new Map<string, number>();

  for (const potentialKey of potentialKeys) {
    const scale = Scale.get(`${potentialKey} major`);
    const scaleNotes = scale.notes;

    let score = 0;
    for (const chord of progression) {
      if (scaleNotes.includes(chord.root)) {
        score += 1;
      }
    }

    // Bonus if all chords fit
    if (score === progression.length) {
      score += 0.5;
    }

    keyScores.set(potentialKey, score);
  }

  // Return the key with the highest score
  let bestKey: string | null = null;
  let bestScore = 0;

  for (const [key, score] of keyScores) {
    if (score > bestScore) {
      bestScore = score;
      bestKey = key;
    }
  }

  // Only return if we have strong confidence (all chords fit)
  if (bestScore >= progression.length) {
    return bestKey;
  }

  return null; // Fall back to existing logic
}

/**
 * Detect the primary tonal center using weighted heuristics:
 *   First chord:      0.5  (strongest signal)
 *   Last chord:       0.25 (resolution point)
 *   Most frequent:    0.25 (appears multiple times = important)
 *   First AND last:  +0.3  bonus (very strong tonic signal)
 */
function detectPrimaryTonic(chords: ParsedChord[]): string | null {
  const validChords = chords.filter((c) => c.valid && c.tonic);
  if (validChords.length === 0) return null;

  // Count how many times each root appears
  const rootCounts = new Map<string, number>();
  for (const chord of validChords) {
    rootCounts.set(chord.tonic, (rootCounts.get(chord.tonic) ?? 0) + 1);
  }

  const maxFreq = Math.max(...rootCounts.values());
  const firstTonic = validChords[0].tonic;
  const lastTonic = validChords[validChords.length - 1].tonic;

  // Score each unique root
  const scores = new Map<string, number>();
  for (const [root, count] of rootCounts) {
    let score = 0;
    if (root === firstTonic) score += 0.5;
    if (root === lastTonic) score += 0.25;
    if (count === maxFreq) score += 0.25;
    if (root === firstTonic && root === lastTonic) score += 0.3;
    scores.set(root, score);
  }

  // Pick highest score, breaking ties by input order
  let bestRoot = firstTonic;
  let bestScore = scores.get(firstTonic) ?? 0;
  for (const [root, score] of scores) {
    if (score > bestScore) {
      bestScore = score;
      bestRoot = root;
    }
  }
  return bestRoot;
}

// ---------------------------------------------------------------------------
// Blues detection (BUG 2)
// ---------------------------------------------------------------------------

/** Detect blues progressions while excluding ii-V-I jazz patterns. */
function isBluesProgression(chords: ParsedChord[]): boolean {
  const validChords = chords.filter(c => c.valid);
  if (validChords.length < 2) return false;

  // Count dominant 7th and minor 7th chords by type name
  const dom7Chords = validChords.filter(c =>
    c.type === 'dominant seventh'
  );

  const min7Chords = validChords.filter(c =>
    c.type === 'minor seventh'
  );

  // EXCLUDE ii-V-I patterns (minor7 → dom7 → resolution)
  // This is jazz, not blues
  for (let i = 0; i < validChords.length - 2; i++) {
    const isMinor7 = min7Chords.some(m => m.tonic === validChords[i].tonic);
    const isDom7 = dom7Chords.some(d => d.tonic === validChords[i + 1].tonic);

    if (isMinor7 && isDom7) {
      return false; // ii-V pattern detected, not blues
    }
  }

  // Blues typically has MULTIPLE dominant 7ths
  if (dom7Chords.length >= 2) {
    return true;
  }

  // OR check for classic I7→IV7 motion (both dom7, a perfect 4th apart)
  for (let i = 0; i < validChords.length - 1; i++) {
    const chord1 = validChords[i];
    const chord2 = validChords[i + 1];

    const bothDom7 =
      dom7Chords.some(d => d.tonic === chord1.tonic) &&
      dom7Chords.some(d => d.tonic === chord2.tonic);

    if (bothDom7) {
      const chroma1 = Note.chroma(chord1.tonic);
      const chroma2 = Note.chroma(chord2.tonic);
      if (chroma1 !== undefined && chroma2 !== undefined) {
        const interval = (chroma2 - chroma1 + 12) % 12;
        if (interval === 5) { // Perfect 4th up
          return true;
        }
      }
    }
  }

  return false;
}

// ---------------------------------------------------------------------------
// Modal signature detection (BUG 3)
// ---------------------------------------------------------------------------

/** Detect modal chord signatures and return bonus scores per scale type. */
function getModalBonuses(chords: ParsedChord[], tonic: string): Map<string, number> {
  const bonuses = new Map<string, number>();
  const tonicChroma = Note.chroma(tonic);
  if (tonicChroma === undefined) return bonuses;

  const tonicChord = chords.find((c) => c.valid && c.tonic === tonic);
  if (!tonicChord) return bonuses;

  const tonicIsMajor = tonicChord.quality === "Major";
  const tonicIsMinor = tonicChord.quality === "Minor";

  let hasFlatVII = false; // major chord 10 semitones up (bVII)
  let hasFlatII = false; // major chord 1 semitone up (bII)
  let hasFlatVI = false; // major chord 8 semitones up (bVI)
  let hasMajorII = false; // major chord 2 semitones up (II)

  for (const chord of chords) {
    if (!chord.valid || chord.tonic === tonic) continue;
    const chordChroma = Note.chroma(chord.tonic);
    if (chordChroma === undefined) continue;
    const interval = (chordChroma - tonicChroma + 12) % 12;

    if (interval === 10 && chord.quality === "Major") hasFlatVII = true;
    if (interval === 1 && chord.quality === "Major") hasFlatII = true;
    if (interval === 8 && chord.quality === "Major") hasFlatVI = true;
    if (interval === 2 && chord.quality === "Major") hasMajorII = true;
  }

  // Dorian: minor tonic + bVII, but NO bVI (bVI signals Aeolian instead)
  if (tonicIsMinor && hasFlatVII && !hasFlatVI) {
    bonuses.set("dorian", 0.15);
  }

  // Phrygian: minor tonic + bII
  if (tonicIsMinor && hasFlatII) {
    bonuses.set("phrygian", 0.15);
  }

  // Lydian: major tonic + major II chord (major II naturally contains #4)
  if (tonicIsMajor && hasMajorII) {
    bonuses.set("lydian", 0.15);
  }

  // Mixolydian: major tonic + bVII
  if (tonicIsMajor && hasFlatVII) {
    bonuses.set("mixolydian", 0.10);
  }

  return bonuses;
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

interface ScoredCandidate {
  entry: WhitelistEntry;
  tonic: string;
  coverage: number; // input notes in scale / total input notes
  scaleRelevance: number; // scale notes used by input / scale size
  rootCoverage: number; // chord roots in scale / total chord roots
  isFirstChordTonic: boolean;
  score: number; // pre-computed composite score
}

/** Small bonus when a dominant chord's tonic matches a mixolydian candidate. */
function getDominantBonus(chords: ParsedChord[], entry: WhitelistEntry, tonic: string): number {
  if (entry.scaleType !== "mixolydian") return 0;
  const chord = chords.find((c) => c.tonic === tonic);
  if (!chord?.valid) return 0;
  const rootChroma = Note.chroma(chord.tonic);
  if (rootChroma === undefined) return 0;
  const chordChromas = noteSetToChromaSet(chord.notes);
  // Minor 7th = 10 semitones above root → hallmark of dominant chord
  if (chordChromas.has((rootChroma + 10) % 12)) return 0.02;
  return 0;
}

function scoreCandidates(
  chords: ParsedChord[],
  allNotes: string[],
  candidateTonics: string[],
  modalBonuses: Map<string, number>,
): ScoredCandidate[] {
  const inputChromas = noteSetToChromaSet(allNotes);

  const rootChromas = new Set<number>();
  for (const c of chords) {
    if (c.valid) {
      const ch = Note.chroma(c.tonic);
      if (ch !== undefined) rootChromas.add(ch);
    }
  }
  const rootChromaArr = Array.from(rootChromas);

  const firstTonic = candidateTonics[0] ?? "";
  const results: ScoredCandidate[] = [];

  for (const tonic of candidateTonics) {
    for (const entry of WHITELIST) {
      const scaleData = Scale.get(`${tonic} ${entry.tonalName}`);
      if (scaleData.empty) continue;

      const scaleChromas = noteSetToChromaSet(scaleData.notes);

      let coveredCount = 0;
      for (const ic of inputChromas) {
        if (scaleChromas.has(ic)) coveredCount++;
      }
      const coverage = inputChromas.size > 0 ? coveredCount / inputChromas.size : 0;

      let scaleUsedCount = 0;
      for (const sc of scaleChromas) {
        if (inputChromas.has(sc)) scaleUsedCount++;
      }
      const scaleRelevance = scaleChromas.size > 0 ? scaleUsedCount / scaleChromas.size : 0;

      let rootCoveredCount = 0;
      for (const rc of rootChromaArr) {
        if (scaleChromas.has(rc)) rootCoveredCount++;
      }
      const rootCoverage = rootChromaArr.length > 0 ? rootCoveredCount / rootChromaArr.length : 0;

      const isFirstChordTonic = tonic === firstTonic;

      // Composite score with bonuses
      let score = coverage * 0.4 + scaleRelevance * 0.3 + rootCoverage * 0.3;
      if (isFirstChordTonic) score += 0.05;
      // Slight preference for the two "base" scales (ionian/aeolian)
      if (entry.scaleType === "ionian" || entry.scaleType === "aeolian") score += 0.01;
      score += getDominantBonus(chords, entry, tonic);
      // BUG 3: Apply modal signature bonuses
      score += modalBonuses.get(entry.scaleType) ?? 0;

      results.push({
        entry,
        tonic,
        coverage,
        scaleRelevance,
        rootCoverage,
        isFirstChordTonic,
        score,
      });
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Filtering, dedup, sorting
// ---------------------------------------------------------------------------

function isSmallScale(entry: WhitelistEntry): boolean {
  return entry.tier === 2 || entry.tier === 4; // pentatonic (5) or blues (6)
}

function filterAndRank(candidates: ScoredCandidate[]): ScoredCandidate[] {
  // --- Pass 1: strict (all roots in scale + good coverage) ---
  const strict = candidates.filter((c) => {
    if (c.rootCoverage < 1.0) return false;
    return isSmallScale(c.entry) ? c.scaleRelevance >= 0.8 : c.coverage >= 0.7;
  });

  // --- Pass 2: relaxed (catches harmonic minor, blues, etc.) ---
  const strictKeys = new Set(strict.map((c) => `${c.tonic}_${c.entry.tonalName}`));
  const relaxed = candidates.filter((c) => {
    if (strictKeys.has(`${c.tonic}_${c.entry.tonalName}`)) return false;
    if (c.rootCoverage < 0.75) return false;
    return isSmallScale(c.entry) ? c.scaleRelevance >= 0.6 : c.coverage >= 0.6;
  });

  let filtered = strict.length > 0 ? [...strict, ...relaxed] : relaxed;
  if (filtered.length === 0) return [];

  // Dedup enharmonic equivalents (same absolute pitch-class set + same scale type)
  const seenEnharmonic = new Set<string>();
  filtered = filtered.filter((c) => {
    const scaleData = Scale.get(`${c.tonic} ${c.entry.tonalName}`);
    const key = `${pitchClassSetKey(scaleData.notes)}_${c.entry.tonalName}`;
    if (seenEnharmonic.has(key)) return false;
    seenEnharmonic.add(key);
    return true;
  });

  // Sort by composite score, then by tier
  filtered.sort((a, b) => {
    const diff = b.score - a.score;
    if (Math.abs(diff) > 0.001) return diff;
    return a.entry.tier - b.entry.tier;
  });

  // Limit 1: at most 2 tier-1 modes sharing the same underlying pitch-class set.
  const modeChromaCount = new Map<string, number>();
  filtered = filtered.filter((c) => {
    if (c.entry.tier !== 1) return true;
    const scaleData = Scale.get(`${c.tonic} ${c.entry.tonalName}`);
    const pcsKey = pitchClassSetKey(scaleData.notes);
    const count = modeChromaCount.get(pcsKey) ?? 0;
    if (count >= 2) return false;
    modeChromaCount.set(pcsKey, count + 1);
    return true;
  });

  // Limit 2: at most 2 tier-1 modes per tonic.
  const modePerTonicCount = new Map<string, number>();
  filtered = filtered.filter((c) => {
    if (c.entry.tier !== 1) return true;
    const count = modePerTonicCount.get(c.tonic) ?? 0;
    if (count >= 2) return false;
    modePerTonicCount.set(c.tonic, count + 1);
    return true;
  });

  return filtered;
}

// ---------------------------------------------------------------------------
// Pentatonic companion injection (BUG 1 fix)
// ---------------------------------------------------------------------------

function findViableCompanion(
  allCandidates: ScoredCandidate[],
  tonic: string,
  pentatonicName: string,
): ScoredCandidate | undefined {
  const c = allCandidates.find(
    (x) => x.tonic === tonic && x.entry.tonalName === pentatonicName,
  );
  if (!c) return undefined;
  // Pentatonic companions just need decent scale relevance;
  // root coverage is less important for a 5-note subset companion.
  if (c.scaleRelevance >= 0.6) return c;
  return undefined;
}

function injectPentatonicCompanion(
  ranked: ScoredCandidate[],
  allCandidates: ScoredCandidate[],
): ScoredCandidate[] {
  const topMode = ranked.find((r) => r.entry.tier === 1);
  if (!topMode) return ranked;

  // BUG 1 FIX: Choose pentatonic based on the top mode's family.
  // Major-flavored modes (Ionian, Lydian, Mixolydian) → major pentatonic
  // Minor-flavored modes (Aeolian, Dorian, Phrygian, Locrian) → minor pentatonic
  const pentatonicName = topMode.entry.family === "major"
    ? "major pentatonic"
    : "minor pentatonic";

  const companion = findViableCompanion(allCandidates, topMode.tonic, pentatonicName);
  if (!companion) return ranked;

  // Remove any existing instance (might be buried at a low rank) then re-insert prominently
  const companionKey = `${companion.tonic}_${companion.entry.tonalName}`;
  const cleaned = ranked.filter((r) => `${r.tonic}_${r.entry.tonalName}` !== companionKey);
  const idx = cleaned.indexOf(topMode);
  cleaned.splice(idx + 1, 0, companion);
  return cleaned;
}

// ---------------------------------------------------------------------------
// Blues overrides (BUG 2 fix)
// ---------------------------------------------------------------------------

function applyBluesOverrides(
  ranked: ScoredCandidate[],
  allCandidates: ScoredCandidate[],
  tonic: string,
): ScoredCandidate[] {
  // Filter out scales that are inappropriate for blues context
  const bluesExcluded = new Set(["ionian", "harmonic minor", "melodic minor", "major blues"]);
  let result = ranked.filter((c) => !bluesExcluded.has(c.entry.scaleType));

  // Find the three priority scales from all candidates
  const findCandidate = (scaleType: string) =>
    allCandidates.find((c) => c.tonic === tonic && c.entry.scaleType === scaleType);

  const minorPenta = findCandidate("minor pentatonic");
  const mixolydian = findCandidate("mixolydian");
  const minorBlues = findCandidate("minor blues");

  // Remove these from result (to re-insert in priority order)
  const priorityTypes = new Set(["minor pentatonic", "mixolydian", "minor blues"]);
  result = result.filter((c) => !priorityTypes.has(c.entry.scaleType));

  // Build prioritized list: minor pentatonic → Mixolydian → blues
  const prioritized: ScoredCandidate[] = [];
  if (minorPenta) prioritized.push(minorPenta);
  if (mixolydian) prioritized.push(mixolydian);
  if (minorBlues) prioritized.push(minorBlues);

  return [...prioritized, ...result];
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function analyzeProgression(input: string): AnalysisResult {
  const chords = parseChords(input);
  const validChords = chords.filter((c) => c.valid);
  if (validChords.length === 0) return null;

  const harmonicTonic = detectTonicFromHarmony(validChords);
  const primaryTonic = harmonicTonic || detectPrimaryTonic(validChords);
  if (!primaryTonic) return null;

  const allNotes = mergeNotes(validChords);
  const candidateTonics = [primaryTonic];

  // BUG 3: Detect modal signatures and compute bonus scores
  const modalBonuses = getModalBonuses(validChords, primaryTonic);

  const allCandidates = scoreCandidates(validChords, allNotes, candidateTonics, modalBonuses);
  let ranked = filterAndRank(allCandidates);

  // BUG 2: Detect blues progressions and apply special handling
  const blues = isBluesProgression(validChords);

  if (blues) {
    ranked = applyBluesOverrides(ranked, allCandidates, primaryTonic);
  } else {
    // Score gap cutoff BEFORE companion injection: drop results too far
    // below the top result. The companion is added separately afterward.
    if (ranked.length > 1) {
      const topScore = ranked[0].score;
      ranked = ranked.filter((c, i) => {
        if (i === 0) return true;
        return topScore - c.score <= 0.10;
      });
    }
    ranked = injectPentatonicCompanion(ranked, allCandidates);
  }

  // BUG 4: Hard limit of 3 results
  const top = ranked.slice(0, 3);

  if (top.length === 0) return null;

  return top.map((c) => ({
    displayName: `${c.tonic} ${c.entry.displaySuffix}`,
    scaleType: c.entry.scaleType,
    tonic: c.tonic,
    coverage: c.coverage,
  }));
}
