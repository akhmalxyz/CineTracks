// TypeScript interfaces for the application
// Common types

export enum WatchStatus {
  CURRENTLY_WATCHING = 'CURRENTLY_WATCHING',
  PLAN_TO_WATCH = 'PLAN_TO_WATCH', 
  COMPLETED = 'COMPLETED'
}

export interface MovieWatchlistItem {
  id?: number;
  username: string;
  movieId: string;
  status: WatchStatus;
  createdAt?: number;
  updatedAt?: number;
}

export interface TvShowWatchlistItem {
  id?: number;
  username: string;
  tvShowId: string;
  currentSeason?: number;
  currentEpisode?: number;
  status: WatchStatus;
  createdAt?: number;
  updatedAt?: number;
}

// Movie related interfaces
export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
  trailerUrl?: string;
}

export interface DetailedMovie extends Movie {
  vote_count: number;
  popularity: number;
  runtime?: number;
  budget?: number | null;
  revenue?: number | null;
  genres?: { id: number; name: string }[];
  production_companies?: { 
    id: number; 
    name: string; 
    logo_path?: string | null;
    origin_country?: string;
  }[];
  production_countries?: { iso_3166_1: string; name: string }[];
  spoken_languages?: { english_name: string; iso_639_1: string; name: string }[];
  homepage?: string;
  tagline?: string;
  status?: string;
  credits?: {
    cast: CastMember[];
    crew: CrewMember[];
  };
  similar?: {
    results: Movie[];
  };
  belongs_to_collection?: {
    id: number;
    name: string;
    poster_path: string | null;
    backdrop_path: string | null;
  };
}

// TV Show related interfaces
export interface TvShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  first_air_date: string;
  vote_average: number;
  genre_ids: number[];
  origin_country: string[];
  original_language: string;
  popularity: number;
  trailerUrl?: string;
}

export interface DetailedTvShow extends TvShow {
  last_air_date?: string;
  vote_count: number;
  number_of_seasons: number;
  number_of_episodes: number;
  in_production?: boolean;
  status?: string;
  tagline?: string;
  homepage?: string;
  episode_run_time?: number[];
  type?: string;
  genres?: { id: number; name: string }[];
  seasons?: Season[];
  created_by?: Creator[];
  networks?: Network[];
  production_companies?: ProductionCompany[];
  credits?: {
    cast: CastMember[];
    crew: CrewMember[];
  };
  similar?: {
    results: TvShow[];
  };
}

export interface Season {
  id: number;
  season_number: number;
  episode_count: number;
  air_date?: string;
  name: string;
  overview?: string;
  poster_path?: string;
}

export interface Creator {
  id: number;
  name: string;
  profile_path?: string;
  imdbId?: string;
}

export interface Network {
  id: number;
  name: string;
  logo_path?: string;
  origin_country?: string;
}

export interface ProductionCompany {
  id: number;
  name: string;
  logo_path?: string;
  origin_country?: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  imdbId?: string;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  profile_path: string | null;
  imdbId?: string;
}

// User related interfaces
export interface User {
  id?: number;
  username: string;
  email?: string;
  displayName?: string;
  profileImage?: string;
  isGuest?: boolean;
  roles?: string[];
}

// Auth related interfaces
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isGuest: boolean;
  login: (username: string, password: string) => Promise<User>;
  register: (username: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  loginAsGuest: () => Promise<User>;
}
