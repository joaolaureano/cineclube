import express from "express";
import {
  Controller,
  Route,
  Post,
  Tags,
  Request,
  Security,
  SuccessResponse,
  Get,
  Path,
  Body,
} from "tsoa";

import { HttpResponse } from "../utils/httpResponse";
import UserService from "../services/UserService";
import AuthService, { SESSION_COOKIE } from "../services/AuthService";
import { Achievement, UserMovie } from "../models";
import { MovieUserStatus } from "../enum/MovieUserStatus";

@Route("user")
@Tags("UserController")
export class UserController extends Controller {
  /**
   * Troca o id_token do Google por uma sessao da aplicacao.
   *
   * Nao leva @Security: e justamente a rota que cria a sessao, e o que
   * autentica aqui e a assinatura do Google conferida em AuthService.
   */
  @Post("/auth")
  @SuccessResponse("200")
  async authenticate(
    @Body() requestBody: { credential: string },
    @Request() request: express.Request
  ): Promise<UserAuthenticationResponse> {
    const { credential } = requestBody ?? {};
    if (!credential) {
      this.setStatus(400);
      return { success: false, message: "Credential is required" };
    }

    let user;
    try {
      user = await AuthService.verifyGoogleIdToken(credential);
    } catch (err) {
      this.setStatus(401);
      return {
        success: false,
        message: "Could not authenticate",
        details: (err as Error).message,
      };
    }

    try {
      const existingUser = await UserService.findUserById(user.id);

      if (existingUser) {
        setSessionCookie(request, await AuthService.issueSession(user));
        this.setStatus(200);
        return {
          success: true,
          message: "User already exists.",
          body: {
            user: {
              ...user,
              randomness: existingUser.randomness,
            },
          },
        };
      }

      const createdUser = await UserService.createUser(user);
      if (createdUser) {
        setSessionCookie(request, await AuthService.issueSession(user));
        this.setStatus(200);
        return {
          success: true,
          message: "New user successfully created.",
          body: {
            user: {
              photo_path: createdUser.photo_path,
              id: createdUser.id,
              name: createdUser.name,
              randomness: createdUser.randomness,
            },
          },
          firstLogin: true,
        };
      }

      throw new Error();
    } catch (err) {
      this.setStatus(500);
      const error = err as Error;
      return {
        success: false,
        message: "Internal server error.",
        details: error.message,
      };
    }
  }

  @Post("/logout")
  @SuccessResponse("200")
  async logout(
    @Request() request: express.Request
  ): Promise<{ success: boolean; message: string }> {
    //Max-Age=0 e o que apaga o cookie no navegador; limpar so o estado do
    //cliente deixaria a sessao valida para quem ainda tivesse o valor
    request.res?.append(
      "Set-Cookie",
      `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`
    );

    this.setStatus(200);
    return { success: true, message: "Logged out" };
  }

  @Post("/movie")
  @SuccessResponse("200")
  @Security("bearer")
  async setUserMovieStatus(
    @Body() requestBody: { movie_id: string; status: MovieUserStatus },
    @Request() request: express.Request
  ): Promise<MovieStatusResponse> {
    //Retorno -> Se tiver um body é porque alguma conquista foi atingida
    const { movie_id, status } = requestBody;
    const { user } = request;
    if (!movie_id || !status) {
      this.setStatus(400);
      throw new Error("Não foi possivel associar esse filme e usuário");
    }
    try {
      if (user) {
        const user_id = user?.id;
        let achievements: Achievement[] | undefined = undefined;
        switch (status) {
          case MovieUserStatus.WATCHED_AND_LIKED:
            achievements = await UserService.setMovieStatusWatchedLiked(
              movie_id,
              user_id,
              status
            );
            this.setStatus(200);
            if (achievements) {
              return {
                message: "User and movie associated",
                success: true,
                body: {
                  achievements: achievements,
                },
              };
            } else
              return {
                message: "User and movie associated",
                success: true,
              };
          case MovieUserStatus.WATCHED_AND_DISLIKED:
            achievements = await UserService.setMovieStatusWatchedDisliked(
              movie_id,
              user_id,
              status
            );
            this.setStatus(200);
            if (achievements) {
              return {
                message: "User and movie associated",
                success: true,
                body: {
                  achievements: achievements,
                },
              };
            } else
              return {
                message: "User and movie associated",
                success: true,
              };
          case MovieUserStatus.DONT_WANT_TO_WATCH:
            await UserService.setMovieStatusDontWantWatch(
              movie_id,
              user_id,
              status
            );
            this.setStatus(200);
            return {
              message: "User and movie associated",
              success: true,
            };
          case MovieUserStatus.NONE:
            await UserService.deleteUserMovie(movie_id, user_id);
            this.setStatus(200);
            return {
              message: "Status reset successfully",
              success: true,
            };
          case MovieUserStatus.WANT_TO_WATCH:
            await UserService.setMovieStatusWantToWatch(
              movie_id,
              user_id,
              status
            );
            this.setStatus(200);
            return {
              message: "User and movie associated",
              success: true,
            };
          default:
            return {
              message: "Status does not exists",
              success: false,
            };
        }
      }
      throw new Error();
    } catch (err) {
      this.setStatus(500);
      const error = err as Error;
      return {
        success: false,
        message: "Internal server error.",
        details: error.message,
      };
    }
  }

  @Get("/movie/{status}")
  @SuccessResponse("200")
  @Security("bearer")
  async getUserMoviesByStatus(
    @Request() request: express.Request,
    @Path() status: string
  ): Promise<UserMoviesStatusListResponse> {
    const { user } = request;
    if (!status) {
      this.setStatus(400);
      return { success: false, message: "Status is required." };
    }
    try {
      if (user) {
        const userMovies = await UserService.getUserMoviesByStatus(
          status,
          user.id
        );
        return {
          success: true,
          message: `Found ${userMovies.length} movies.`,
          body: {
            userMovies,
          },
        };
      }
      throw new Error("User not found;");
    } catch (err) {
      this.setStatus(500);
      const error = err as Error;
      return {
        success: false,
        message: "Internal server error.",
        details: error.message,
      };
    }
  }

  @Post("/preferences")
  @SuccessResponse("200")
  @Security("bearer")
  async setUserPreferences(
    @Body() requestBody: { tag_ids: number[] },
    @Request() request: express.Request
  ): Promise<HttpResponse> {
    const { tag_ids } = requestBody;
    const { user } = request;
    if (!tag_ids) {
      this.setStatus(400);
      throw new Error("Could not find tags");
    }
    try {
      if (user) {
        const { id } = user;
        const response = await UserService.setSignUpPreferences(id, tag_ids);
        if (response) {
          this.setStatus(200);
          return {
            message: "Preferences were set",
            success: true,
          };
        }
      }
      throw new Error();
    } catch (err) {
      this.setStatus(500);
      const error = err as Error;
      return {
        success: false,
        message: "Internal server error.",
        details: error.message,
      };
    }
  }
}

interface UserMoviesStatusListResponse extends HttpResponse {
  body?: {
    userMovies?: UserMovie[];
  };
}

interface UserAuthenticationResponse extends HttpResponse {
  body?: {
    user?: {
      photo_path?: string;
      id: string;
      name: string;
      randomness: number;
    };
  };
  firstLogin?: boolean;
}

interface MovieStatusResponse extends HttpResponse {
  body?: {
    achievements: Achievement[];
  };
}

/**
 * Secure sem excecao: a aplicacao so existe atras do CloudFront, em HTTPS.
 * SameSite=Lax deixa o cookie viajar na navegacao normal mas nao em POST
 * vindo de outro site, que e a protecao contra CSRF de que precisamos aqui.
 */
const setSessionCookie = (request: express.Request, session: string): void => {
  request.res?.append(
    "Set-Cookie",
    [
      `${SESSION_COOKIE}=${session}`,
      "Path=/",
      "HttpOnly",
      "Secure",
      "SameSite=Lax",
      `Max-Age=${AuthService.SESSION_TTL_SECONDS}`,
    ].join("; ")
  );
};
