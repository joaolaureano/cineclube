import express from "express";
import { MovieController } from "../../src/controllers/MovieController";
import MovieService from "../../src/services/MovieService";

jest.mock("../../src/services/MovieService");

const mockedMovieService = MovieService as jest.Mocked<typeof MovieService>;

const buildRequest = (user?: { id: string }) =>
  (({ user } as unknown) as express.Request);

describe("MovieController", () => {
  describe("getAll", () => {
    it("fetches with no filters when tags/platforms are absent", async () => {
      const movies = [{ id: 1, title: "Movie 1" }];
      mockedMovieService.getRecommendedList.mockResolvedValue(movies as any);

      const controller = new MovieController();
      const result = await controller.getAll(buildRequest({ id: "user-1" }));

      expect(mockedMovieService.getRecommendedList).toHaveBeenCalledWith(
        "user-1",
        undefined,
        undefined
      );
      expect(result).toEqual({
        success: true,
        message: "Found 1 movies.",
        body: { movies },
      });
      expect(controller.getStatus()).toBe(200);
    });

    it("splits and parses tags when only tags are present", async () => {
      mockedMovieService.getRecommendedList.mockResolvedValue([] as any);

      const controller = new MovieController();
      await controller.getAll(buildRequest({ id: "user-1" }), "1,2,3");

      expect(mockedMovieService.getRecommendedList).toHaveBeenCalledWith(
        "user-1",
        [1, 2, 3],
        undefined
      );
    });

    it("splits and parses platforms when only platforms are present", async () => {
      mockedMovieService.getRecommendedList.mockResolvedValue([] as any);

      const controller = new MovieController();
      await controller.getAll(buildRequest({ id: "user-1" }), undefined, "4,5");

      expect(
        mockedMovieService.getRecommendedList
      ).toHaveBeenCalledWith("user-1", undefined, [4, 5]);
    });

    it("parses both tags and platforms when both are present", async () => {
      mockedMovieService.getRecommendedList.mockResolvedValue([] as any);

      const controller = new MovieController();
      await controller.getAll(buildRequest({ id: "user-1" }), "1", "2");

      expect(mockedMovieService.getRecommendedList).toHaveBeenCalledWith(
        "user-1",
        [1],
        [2]
      );
    });

    it("passes through NaN for a malformed tags value (bug: current behaviour is not validated)", async () => {
      mockedMovieService.getRecommendedList.mockResolvedValue([] as any);

      const controller = new MovieController();
      await controller.getAll(buildRequest({ id: "user-1" }), "foo");

      const callArgs = mockedMovieService.getRecommendedList.mock.calls[0];
      expect(callArgs[0]).toBe("user-1");
      expect(callArgs[1]).toHaveLength(1);
      expect(Number.isNaN(callArgs[1]?.[0])).toBe(true);
    });

    it("falls through to the throw/500 branch when there is no user on the request", async () => {
      const controller = new MovieController();
      const result = await controller.getAll(buildRequest(undefined));

      expect(mockedMovieService.getRecommendedList).not.toHaveBeenCalled();
      expect(result.success).toBe(false);
      expect(controller.getStatus()).toBe(500);
    });

    it("returns 500 with the error message when the service rejects", async () => {
      mockedMovieService.getRecommendedList.mockRejectedValue(
        new Error("db down")
      );

      const controller = new MovieController();
      const result = await controller.getAll(buildRequest({ id: "user-1" }));

      expect(result).toEqual({
        success: false,
        message: "Internal server error.",
        details: "db down",
      });
      expect(controller.getStatus()).toBe(500);
    });
  });

  describe("getById", () => {
    it("returns the movie with 200 when found", async () => {
      const movie = { id: 1, title: "Movie 1" };
      mockedMovieService.getById.mockResolvedValue(movie as any);

      const controller = new MovieController();
      const result = await controller.getById(1);

      expect(mockedMovieService.getById).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        success: true,
        message: "Movie found",
        body: { movies: [movie] },
      });
      expect(controller.getStatus()).toBe(200);
    });

    it("returns an explicit 404 when the movie is not found", async () => {
      mockedMovieService.getById.mockResolvedValue(undefined as any);

      const controller = new MovieController();
      const result = await controller.getById(999);

      expect(result).toEqual({
        success: false,
        message: "Movie not found",
      });
      expect(controller.getStatus()).toBe(404);
    });

    it("returns 500 with the error message when the service rejects", async () => {
      mockedMovieService.getById.mockRejectedValue(new Error("db down"));

      const controller = new MovieController();
      const result = await controller.getById(1);

      expect(result).toEqual({
        success: false,
        message: "Internal server error.",
        details: "db down",
      });
      expect(controller.getStatus()).toBe(500);
    });
  });
});
