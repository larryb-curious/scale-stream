export interface Song {
  song: string;
  artist: string;
  mode: string;
  key: string;
  youtubeId: string;
  timestamp: string;
  confidence: string;
  notes: string;
}

export declare const songDatabase: Song[];
export declare const getSongsByMode: (mode: string) => Song[];
export declare const getYouTubeEmbedUrl: (youtubeId: string, timestamp?: string) => string;
export declare const getYouTubeThumbnail: (youtubeId: string, quality?: string) => string;
export default songDatabase;
