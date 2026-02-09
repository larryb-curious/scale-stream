import { useState } from "react";
import {
  getSongsByMode,
  getYouTubeEmbedUrl,
  getYouTubeThumbnail,
} from "../data/songDatabase";

interface Song {
  song: string;
  artist: string;
  mode: string;
  key: string;
  youtubeId: string;
  timestamp: string;
  confidence: string;
  notes: string;
}

interface VideoCarouselProps {
  mode: string;
}

export default function VideoCarousel({ mode }: VideoCarouselProps) {
  const songs: Song[] = getSongsByMode(mode);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

  console.log("[VideoCarousel] currentIndex:", currentIndex, "playingIndex:", playingIndex, "match:", playingIndex === currentIndex);

  if (songs.length === 0) return null;

  const song = songs[currentIndex];

  const goTo = (index: number) => {
    setCurrentIndex(index);
    setPlayingIndex(null);
  };

  const prev = () => goTo(Math.max(0, currentIndex - 1));
  const next = () => goTo(Math.min(songs.length - 1, currentIndex + 1));

  return (
    <div className="w-full">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
        Hear {mode.split(" ").map(w => w[0].toUpperCase() + w.slice(1)).join(" ")} in the wild
      </h3>

      <div className="rounded-xl border border-gray-700/60 bg-gray-800/50 overflow-hidden">
        {/* 16:9 video container — padding-bottom trick */}
        <div
          style={{
            position: "relative",
            width: "100%",
            paddingBottom: "56.25%",
            backgroundColor: "#000",
          }}
        >
          {(() => { console.log("[VideoCarousel] Rendering:", playingIndex === currentIndex ? "IFRAME" : "THUMBNAIL", "for song:", song.song); return null; })()}
          {playingIndex === currentIndex ? (
            <iframe
              src={`${getYouTubeEmbedUrl(song.youtubeId, song.timestamp)}&autoplay=1`}
              title={`${song.song} by ${song.artist}`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
              }}
            />
          ) : (
            <div
              onClick={() => {
                console.log("[VideoCarousel] Click! Setting playingIndex to", currentIndex);
                setPlayingIndex(currentIndex);
              }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                cursor: "pointer",
              }}
            >
              <img
                src={getYouTubeThumbnail(song.youtubeId, "hq")}
                alt={`${song.song} by ${song.artist}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
              {/* Play button */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgba(0,0,0,0.3)",
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    backgroundColor: "#dc2626",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Song info + navigation */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Prev button */}
            <button
              type="button"
              onClick={prev}
              disabled={currentIndex === 0}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-700 text-white disabled:opacity-30 hover:bg-gray-600 transition-colors cursor-pointer disabled:cursor-default"
              aria-label="Previous song"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Song details */}
            <div className="text-center min-w-0 px-3">
              <p className="text-sm font-semibold text-white truncate">
                {song.song}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {song.artist} — {song.key}
              </p>
              <p className="text-xs text-gray-500 italic truncate mt-0.5">
                {song.notes}
              </p>
            </div>

            {/* Next button */}
            <button
              type="button"
              onClick={next}
              disabled={currentIndex === songs.length - 1}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-700 text-white disabled:opacity-30 hover:bg-gray-600 transition-colors cursor-pointer disabled:cursor-default"
              aria-label="Next song"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Dot indicators */}
          {songs.length > 1 && (
            <div className="flex justify-center gap-1.5 mt-3">
              {songs.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goTo(i)}
                  className={`h-2 w-2 rounded-full transition-colors cursor-pointer ${
                    i === currentIndex
                      ? "bg-indigo-500"
                      : "bg-gray-600 hover:bg-gray-500"
                  }`}
                  aria-label={`Go to song ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
