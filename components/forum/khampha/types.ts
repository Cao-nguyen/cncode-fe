export interface KhamphaVideo {
  _id: string;
  videoUrl: string;
  streamUrl?: string;
  thumbnailUrl: string;
  caption: string;
  author: {
    _id: string;
    fullName: string;
    username: string;
    avatar: string;
    followers: number;
    following: number;
  };
  music?: {
    title: string;
    artist: string;
    coverUrl: string;
  };
  hashtags: string[];
  likeCount: number;
  commentCount: number;
  shareCount: number;
  viewCount: number;
  favoriteCount: number;
  likes: string[];
  favorites: string[];
  createdAt: string;
  duration?: number;
}

export type VideoTab = 'khampha' | 'friends' | 'following';
