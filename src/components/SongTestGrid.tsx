import { songDatabase, getYouTubeThumbnail } from "../data/songDatabase";

export default function SongTestGrid() {
  const modes = [...new Set(songDatabase.map((s: any) => s.mode))];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Song Database Test ({songDatabase.length} songs)</h1>
          <a href="#" className="text-sm text-indigo-400 hover:text-indigo-300">&larr; Back to app</a>
        </div>

        {modes.map((mode: string) => {
          const songs = songDatabase.filter((s: any) => s.mode === mode);
          return (
            <div key={mode} className="mb-10">
              <h2 className="text-xl font-semibold text-indigo-300 mb-4">
                {mode} ({songs.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {songs.map((song: any) => (
                  <div key={`${song.youtubeId}-${song.timestamp}`} className="space-y-2">
                    <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                      <img
                        src={getYouTubeThumbnail(song.youtubeId, "mq")}
                        alt={song.song}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.opacity = "0.2";
                        }}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white truncate">{song.song}</p>
                      <p className="text-xs text-gray-400 truncate">{song.artist} — {song.key}</p>
                      <p className="text-xs text-gray-500 truncate">t={song.timestamp}s | {song.youtubeId}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
