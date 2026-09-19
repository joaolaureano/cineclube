import express from "express";
import {
  Controller,
  Route,
  Get,
  Tags,
  SuccessResponse,
  Path,
  Security,
  Request,
  Body,
  Query,
} from "tsoa";

import { HttpResponse } from "../utils/httpResponse";
import MovieService from "../services/MovieService";
import { Movie } from "../models";

@Route("movies")
@Tags("MovieController")
export class MovieController extends Controller {
  @Get("/")
  @SuccessResponse("200")
  @Security("bearer")
  async getAll(
    @Request() request: express.Request,
    @Query() tags?: string,
    @Query() platforms?: string
  ): Promise<MovieResponse> {
    const { user } = request;
    try {
      if (user) {
        const filters: { tags?: number[]; platforms?: number[] } = {};

        if (tags) {
          const tagsSplit = tags.split(",");
          const tagsListNumber = tagsSplit.map((tagId) => parseInt(tagId));
          filters.tags = tagsListNumber;
        }

        if (platforms) {
          const platformSplit = platforms.split(",");
          const filterListNumber = platformSplit.map((filter) =>
            parseInt(filter)
          );
          filters.platforms = filterListNumber;
        }

        const movies = await MovieService.getRecommendedList(
          user.id,
          filters.tags,
          filters.platforms
        );

        if (movies) {
          this.setStatus(200);
          return {
            success: true,
            message: `Found ${movies.length} movies.`,
            body: {
              movies,
            },
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

  @Get("/{movie_id}")
  @SuccessResponse("200")
  async getById(@Path() movie_id: number): Promise<MovieResponse> {
    try {
      const movie = await MovieService.getById(movie_id);

      if (movie) {
        this.setStatus(200);
        return {
          success: true,
          message: `Movie found`,
          body: {
            movies: [movie],
          },
        };
      }

      this.setStatus(404);
      return {
        success: false,
        message: `Movie not found`,
      };
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

interface MovieResponse extends HttpResponse {
  body?: {
    movies?: Movie[];
  };
}
