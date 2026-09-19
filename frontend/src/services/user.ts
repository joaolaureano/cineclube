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
  /**
   * Troca o id_token do Google por uma sessao. A resposta traz o cookie
   * httpOnly no Set-Cookie; aqui so interessa o perfil que volta no corpo.
   */
  auth: (credential: string): Promise<AxiosResponse<AuthResponse>> => {
    return api.post("/user/auth", { credential });
  },

  logout: (): Promise<AxiosResponse<{ success: boolean }>> => {
    return api.post("/user/logout");
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

export interface AuthResponse {
  success: boolean;
  message: string;
  //o backend responde firstLogin; ler first_login aqui era o motivo de a tela
  //de preferencias nunca aparecer no primeiro acesso
  firstLogin?: boolean;
  body?: { user: User };
}

export default user;
