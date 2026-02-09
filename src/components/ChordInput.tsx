import { useState, useCallback } from "react";
import { Chord } from "tonal";
import {
  analyzeProgression,
  type AnalysisResult,
  type ScaleRecommendation,
} from "../lib/chordAnalysis";
import scaleTheory, { type ScaleTheoryInfo } from "../data/scaleTheory";
import { getSongsByMode } from "../data/songDatabase";
import VideoCarousel from "./VideoCarousel";

function ScaleCardContent({ theory }: { theory: ScaleTheoryInfo }) {
  return (
    <>
      {/* Degrees */}
      <div className="rounded-lg bg-gray-900/60 px-4 py-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Degrees
        </span>
        <p className="mt-1 text-base font-mono text-white tracking-wide">
          {theory.degrees}
        </p>
      </div>

      {/* Info sections */}
      <dl className="space-y-3 text-sm">
        <div>
          <dt className="font-semibold text-gray-400">Parent Scale</dt>
          <dd className="mt-0.5 text-gray-300">{theory.parentScale}</dd>
        </div>
        <div>
          <dt className="font-semibold text-gray-400">Note</dt>
          <dd className="mt-0.5 text-gray-300">{theory.example}</dd>
        </div>
        <div>
          <dt className="font-semibold text-gray-400">Flavor</dt>
          <dd className="mt-0.5 text-gray-300 italic">{theory.flavor}</dd>
        </div>
        <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 px-3 py-2">
          <dt className="font-semibold text-indigo-400">Pentatonic Tip</dt>
          <dd className="mt-0.5 text-indigo-200/80">{theory.pentatonicTip}</dd>
        </div>
      </dl>
    </>
  );
}

function ScaleCard({
  rec,
  theory,
  defaultExpanded,
}: {
  rec: ScaleRecommendation;
  theory: ScaleTheoryInfo;
  defaultExpanded: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="rounded-xl border border-gray-700/60 bg-gray-800/50 p-5 space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-indigo-300">
          {rec.displayName}
        </h3>
        {theory.alsoKnownAs && (
          <p className="text-sm text-gray-400 mt-0.5">
            aka {theory.alsoKnownAs}
          </p>
        )}
      </div>

      {expanded ? (
        <ScaleCardContent theory={theory} />
      ) : (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
        >
          Show more
        </button>
      )}
    </div>
  );
}

function AlertBox({ message }: { message: string }) {
  return (
    <div className="mt-4 rounded-lg border border-gray-600/50 bg-gray-800/60 px-4 py-3 text-sm text-gray-300">
      {message}
    </div>
  );
}

type Status = "idle" | "loading" | "results" | "parse-error" | "too-few" | "no-match";

export default function ChordInput() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<AnalysisResult>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [warning, setWarning] = useState<string | null>(null);

  const isLoading = status === "loading";

  const handleSubmit = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const tokens = trimmed.split(/[\s,]+/).filter((t) => t.length > 0);
    const valid = tokens.filter((t) => !Chord.get(t).empty);
    const invalid = tokens.filter((t) => Chord.get(t).empty);

    if (valid.length === 0) {
      setResult(null);
      setWarning(null);
      setStatus("parse-error");
      return;
    }

    if (valid.length < 2) {
      setResult(null);
      setWarning(null);
      setStatus("too-few");
      return;
    }

    // Build the input string from only the valid chords
    const analysisInput = valid.join(" ");
    const partialWarning =
      invalid.length > 0
        ? `I couldn't recognize all chords. I analyzed: ${valid.join(", ")}. Check spelling or try standard notation (C, Dm, F#m, Bbmaj7).`
        : null;

    setStatus("loading");
    // Let the spinner render before synchronous analysis
    setTimeout(() => {
      const analysis = analyzeProgression(analysisInput);
      if (analysis && analysis.length > 0) {
        setResult(analysis);
        setWarning(partialWarning);
        setStatus("results");
      } else {
        setResult(null);
        setWarning(null);
        setStatus("no-match");
      }
    }, 0);
  }, [input, isLoading]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      <div className="max-w-md mx-auto">
        <label
          htmlFor="chord-input"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Enter chord progression
        </label>
        <input
          id="chord-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Am7 D9 Gmaj7 (press Enter)"
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <p className="mt-1.5 text-xs text-gray-500">
          Examples: Am D &nbsp;&middot;&nbsp; Em G D C &nbsp;&middot;&nbsp; C F G (minimum 2 chords)
        </p>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!input.trim() || isLoading}
          className="mt-3 w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white tracking-wide uppercase transition-colors hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
        >
          {isLoading ? (
            <span className="inline-flex items-center gap-2">
              <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Analyzing&hellip;
            </span>
          ) : (
            "Find Scales"
          )}
        </button>

        {status === "parse-error" && (
          <AlertBox message="Hmm, I couldn't recognize those chords. Separate chords with spaces or commas (C G Am F) and use standard notation (C, Dm, F#, Bbmaj7). Minimum 2 chords required." />
        )}
        {status === "too-few" && (
          <AlertBox message="Please enter at least 2 chords. The relationships between chords help identify the scale." />
        )}
        {status === "no-match" && (
          <AlertBox message="Interesting! These chords don't strongly match any common scales. Try analyzing just 3-4 chords, and break up long progressions into separate entries for verse, chorus, bridge." />
        )}
      </div>

      {status === "results" && result && result.length > 0 && (
        <div className="mt-6 space-y-4">
          {warning && <AlertBox message={warning} />}
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
            Recommended Scales
          </h2>
          {result.map((rec, index) => {
            const theory = scaleTheory[rec.scaleType];
            const hasSongs = getSongsByMode(rec.scaleType).length > 0;
            if (!theory) {
              return (
                <div
                  key={`${rec.tonic}-${rec.scaleType}`}
                  className="rounded-xl border border-gray-700/60 bg-gray-800/50 px-5 py-4"
                >
                  <h3 className="text-lg text-indigo-300">{rec.displayName}</h3>
                </div>
              );
            }
            return (
              <div
                key={`${rec.tonic}-${rec.scaleType}`}
                className={hasSongs ? "flex flex-col md:flex-row md:gap-6" : ""}
              >
                <div className={hasSongs ? "md:w-3/5" : ""}>
                  <ScaleCard
                    rec={rec}
                    theory={theory}
                    defaultExpanded={index === 0}
                  />
                </div>
                {hasSongs && (
                  <div className="md:w-2/5 mt-4 md:mt-0">
                    <VideoCarousel mode={rec.scaleType} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
