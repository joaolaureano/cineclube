import MovieService from "../../src/services/MovieService";
import { getMockRepository, resetRepositories } from "../helpers/typeormMock";

describe("MovieService", () => {
  beforeEach(() => resetRepositories());

  describe("getById", () => {
    it("returns the movie found by id", async () => {
      const repository = getMockRepository("MovieRepository");
      const movie = { id: 1, title: "Movie" };
      repository.findOne.mockResolvedValue(movie);

      await expect(MovieService.getById(1)).resolves.toBe(movie);
      expect(repository.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe("getRecommendedList", () => {
    describe("when the user has no tag preferences", () => {
      it("filters the not-in-list movies by platform/tags and keeps only super tags", async () => {
        const userTagRepo = getMockRepository("UserTagRepository");
        const movieRepo = getMockRepository("MovieRepository");
        userTagRepo.queryBuilder.getMany.mockResolvedValueOnce([]);

        const movies = [
          {
            id: 1,
            platforms: [{ id: 10 }],
            movies_tags: [
              { tag_id: 1, super: true },
              { tag_id: 2, super: false },
            ],
          },
          {
            id: 2,
            platforms: [{ id: 20 }],
            movies_tags: [{ tag_id: 1, super: true }],
          },
        ];
        movieRepo.queryBuilder.getMany.mockResolvedValueOnce(movies);

        // empty arrays are truthy, so both `if (platforms)`/`if (tags)` fire, and
        // the length===0 early-return branch inside each filter helper is exercised
        const result = await MovieService.getRecommendedList("u1", [], []);

        expect(result).toEqual([
          {
            id: 1,
            platforms: [{ id: 10 }],
            movies_tags: [{ tag_id: 1, super: true }],
          },
          {
            id: 2,
            platforms: [{ id: 20 }],
            movies_tags: [{ tag_id: 1, super: true }],
          },
        ]);
      });

      it("returns movies unfiltered when no platforms/tags are given", async () => {
        const userTagRepo = getMockRepository("UserTagRepository");
        const movieRepo = getMockRepository("MovieRepository");
        userTagRepo.queryBuilder.getMany.mockResolvedValueOnce([]);

        const movies = [
          {
            id: 1,
            platforms: [{ id: 10 }],
            movies_tags: [{ tag_id: 1, super: true }],
          },
        ];
        movieRepo.queryBuilder.getMany.mockResolvedValueOnce(movies);

        const result = await MovieService.getRecommendedList("u1");

        expect(result).toEqual(movies);
      });

      it("filters movies down to those matching the given tags/platforms", async () => {
        const userTagRepo = getMockRepository("UserTagRepository");
        const movieRepo = getMockRepository("MovieRepository");
        userTagRepo.queryBuilder.getMany.mockResolvedValueOnce([]);

        const movies = [
          {
            id: 1,
            platforms: [{ id: 10 }],
            movies_tags: [{ tag_id: 1, super: true }],
          },
          {
            id: 2,
            platforms: [{ id: 20 }],
            movies_tags: [{ tag_id: 2, super: true }],
          },
        ];
        movieRepo.queryBuilder.getMany.mockResolvedValueOnce(movies);

        const result = await MovieService.getRecommendedList("u1", [1], [10]);

        expect(result).toEqual([
          {
            id: 1,
            platforms: [{ id: 10 }],
            movies_tags: [{ tag_id: 1, super: true }],
          },
        ]);
      });

      it("falls back to a super-tags-only query when the first query resolves undefined", async () => {
        const userTagRepo = getMockRepository("UserTagRepository");
        const movieRepo = getMockRepository("MovieRepository");
        userTagRepo.queryBuilder.getMany.mockResolvedValueOnce([]);

        const fallbackMovies = [{ id: 3, platforms: [], movies_tags: [] }];
        movieRepo.queryBuilder.getMany
          .mockResolvedValueOnce(undefined) // first getMoviesNotInUserLists(user_id) call
          .mockResolvedValueOnce(fallbackMovies); // getMoviesNotInUserLists(user_id, true)

        const result = await MovieService.getRecommendedList("u1");

        expect(result).toBe(fallbackMovies);

        // the second call is the superTags=true fallback: its movies.movies_tags
        // leftJoinAndSelect condition must be the "super = true" filter, unlike the
        // first (superTags=false) call which used an empty condition
        const tagJoinCalls = movieRepo.queryBuilder.leftJoinAndSelect.mock.calls.filter(
          (call) => call[0] === "movie.movies_tags"
        );
        expect(tagJoinCalls[0][2]).toBe("");
        expect(tagJoinCalls[1][2]).toBe("movie_tag.super = true");
      });
    });

    describe("when the user has tag preferences", () => {
      it("returns [] when no movie matches any of the user's tags", async () => {
        const userTagRepo = getMockRepository("UserTagRepository");
        const movieRepo = getMockRepository("MovieRepository");
        userTagRepo.queryBuilder.getMany.mockResolvedValueOnce([
          { tag_id: 1, total_point: 10 },
        ]);
        movieRepo.queryBuilder.getMany.mockResolvedValueOnce([]);

        await expect(MovieService.getRecommendedList("u1")).resolves.toEqual(
          []
        );
      });

      it("returns undefined when the id-based movie lookup resolves undefined", async () => {
        const userTagRepo = getMockRepository("UserTagRepository");
        const movieRepo = getMockRepository("MovieRepository");
        userTagRepo.queryBuilder.getMany.mockResolvedValueOnce([
          { tag_id: 1, total_point: 10 },
        ]);
        movieRepo.queryBuilder.getMany
          .mockResolvedValueOnce([
            { id: 1, movies_tags: [{ tag_id: 1, weight: 1, super: true }] },
          ])
          .mockResolvedValueOnce(undefined); // getMovieListByIds

        await expect(
          MovieService.getRecommendedList("u1")
        ).resolves.toBeUndefined();
      });

      it("documents that a tag missing from the user's point map yields a NaN score without crashing", async () => {
        const userTagRepo = getMockRepository("UserTagRepository");
        const movieRepo = getMockRepository("MovieRepository");
        userTagRepo.queryBuilder.getMany.mockResolvedValueOnce([
          { tag_id: 1, total_point: 10 },
        ]);

        // tag_id 2 has no entry in mapuser_tagTotalPoint -> `undefined * weight` = NaN;
        // this is a known bug (fixed in a later commit), documented here rather than fixed
        const movie = {
          id: 1,
          platforms: [],
          movies_tags: [{ tag_id: 2, weight: 4, super: true }],
        };
        movieRepo.queryBuilder.getMany
          .mockResolvedValueOnce([movie])
          .mockResolvedValueOnce([movie]);

        const result = await MovieService.getRecommendedList("u1");

        // a single-element sort is a no-op regardless of the NaN comparator, so the
        // movie still comes back untouched by the broken score calculation
        expect(result).toEqual([movie]);
      });

      it("sorts matching movies by descending score and applies tag/platform filters", async () => {
        const userTagRepo = getMockRepository("UserTagRepository");
        const movieRepo = getMockRepository("MovieRepository");
        userTagRepo.queryBuilder.getMany.mockResolvedValueOnce([
          { tag_id: 1, total_point: 10 },
        ]);

        // movie 1 score = 10 * 1 = 10; movie 2 score = 10 * 3 = 30 -> movie 2 first
        const movie1 = {
          id: 1,
          platforms: [{ id: 10 }],
          movies_tags: [{ tag_id: 1, weight: 1, super: true }],
        };
        const movie2 = {
          id: 2,
          platforms: [{ id: 10 }],
          movies_tags: [{ tag_id: 1, weight: 3, super: true }],
        };
        movieRepo.queryBuilder.getMany
          .mockResolvedValueOnce([movie1, movie2]) // tag/user-filtered movies query
          .mockResolvedValueOnce([movie1, movie2]); // getMovieListByIds

        const result = await MovieService.getRecommendedList("u1", [1], [10]);

        expect(result).toEqual([movie2, movie1]);
      });
    });
  });
});
