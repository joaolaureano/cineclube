import { AxiosResponse } from "axios";
import api from "../api/api";
import { User } from "../types/user";
import { UserMovie } from "../types/UserMovie";
import { MovieUserStatus } from "../types/userMovieStatus";

interface PutMoviePayload {
  id: string;
  status: MovieUserStatus;
}

const user = {
  auth: (): Promise<AxiosResponse<User>> => {
    return api.post("/user/auth", {
      transformResponse: parseUser,
    });
  },

  setMovieStatus: (data: PutMoviePayload) => {
    const { id, status } = data;
    return api.post("/user/movie", {
      movie_id: id,
      status,
    });
  },

  getMovieByStatus: (
    data: MovieUserStatus
  ): Promise<AxiosResponse<UserMovie[]>> => {
    return api.get("/user/movie/" + data, {
      transformResponse: parseMovieCardInfo,
    });
  },
};

const parseMovieCardInfo = (data: string): UserMovie[] => {
  const response = JSON.parse(data);

  if (!response.success) {
    throw new Error("Erro");
  }

  const moviesResponse = response.body.userMovies;
  const movies: UserMovie[] = [];
  moviesResponse.forEach((movie: any) => {
    movies.push(movie as UserMovie);
  });

  return movies;
};

const parseUser = (data: string): User => {
  const response = JSON.parse(data);
  if (!response.success) {
    throw new Error("Erro");
  }

  const user: User = {
    ...response.body?.user,
    first_login: response.first_login,
  };

  return user;
};

export default user;
