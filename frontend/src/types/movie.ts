import { MoviesTags } from "./moviesTags";
import { Platform } from "./platform";

export interface Movie {
  id: number;
  title: string;
  original_title: string;
  synopsis: string;
  critic: string;
  curator: string;
  year: number;
  path_banner: string;
  platforms: Platform[];
  movies_tags: MoviesTags[];
  director: string;
  duration: number;
  actors: string[];
}

export interface RecommendedMovieMessage {
  size_list: number;
  title: string;
  platform: string[];
}

export interface ActorDto {
  id: number;
  name: string;
}

export interface CastDto {
  actor_id: number;
  movie_id: number;
  director: boolean;
  actor: ActorDto;
}

export interface MovieDto {
  id: number;
  title: string;
  original_title: string;
  synopsis: string;
  critic: string;
  curator: string;
  year: number;
  path_banner: string;
  platforms: Platform[];
  movies_tags: MoviesTags[];
  duration: number;
  cast: CastDto[];
}

export interface MoviesDto {
  movies: MovieDto[];
  movie_ids: number[];
}

export interface MovieState {
  movies: MovieMap;
  movie_ids: number[];
  selectedMovieIndex: number;
}

export interface MovieMap {
  [movie_id: number]: Movie;
}
export interface MovieStatus {
  movies: Movie[];
}

export enum MovieUserStatus {
  ALREADY_WATCHED = "already_watched",
  WANT_TO_WATCH = "want_to_watch",
  DONT_WANT_TO_WATCH = "dont_want_to_watch",
  NONE = "none",
}
