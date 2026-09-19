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
  //troca o id_token do Google por uma sessao; o cookie vem no Set-Cookie e o
  //corpo traz o perfil
  auth: (credential: string): Promise<AxiosResponse<User>> => {
    //transformResponse e config, nao corpo: passa-lo como segundo argumento
    //enviava o parser como payload e nunca o aplicava na resposta
    return api.post(
      "/user/auth",
      { credential },
      { transformResponse: parseUser }
    );
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

const parseUser = (data: string): User => {
  const response = JSON.parse(data);
  if (!response.success) {
    throw new Error("Erro");
  }

  const user: User = {
    ...response.body?.user,
    //o backend responde firstLogin; ler first_login era o motivo de a tela de
    //preferencias nunca aparecer no primeiro acesso
    first_login: response.firstLogin,
  };

  return user;
};

export default user;
