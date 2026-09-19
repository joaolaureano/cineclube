import { Movie } from "./movie";

export interface UserMovie {
  movie_id: number;
  status: string;
  created_at: Date;
  updated_at: Date;
  movie: Movie;
}
