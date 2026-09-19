import UserService from "../../src/services/UserService";
import { MovieUserStatus } from "../../src/enum/MovieUserStatus";
import { getMockRepository, resetRepositories } from "../helpers/typeormMock";

describe("UserService", () => {
  beforeEach(() => resetRepositories());

  describe("createUser", () => {
    it("forces randomness to 0 and saves the new user", async () => {
      const repository = getMockRepository("UserRepository");
      repository.save.mockImplementation(async (u) => u);

      const result = await UserService.createUser({
        id: "u1",
        name: "Jane",
        email: "jane@example.com",
        photo_path: "pic.png",
      });

      expect(result).toMatchObject({
        id: "u1",
        name: "Jane",
        email: "jane@example.com",
        photo_path: "pic.png",
        randomness: 0,
      });
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({ randomness: 0, id: "u1" })
      );
    });
  });

  describe("findUserById", () => {
    it("returns the user when found", async () => {
      const repository = getMockRepository("UserRepository");
      const user = { id: "u1", name: "Jane" };
      repository.findOne.mockResolvedValue(user);

      await expect(UserService.findUserById("u1")).resolves.toBe(user);
      expect(repository.findOne).toHaveBeenCalledWith("u1");
    });

    it("returns undefined when the user does not exist", async () => {
      const repository = getMockRepository("UserRepository");
      repository.findOne.mockResolvedValue(undefined);

      await expect(
        UserService.findUserById("missing")
      ).resolves.toBeUndefined();
    });
  });

  describe("getUserMoviesByStatus", () => {
    it("returns an empty list untouched", async () => {
      const repository = getMockRepository("UserMovieRepository");
      repository.find.mockResolvedValue([]);

      await expect(
        UserService.getUserMoviesByStatus(MovieUserStatus.WANT_TO_WATCH, "u1")
      ).resolves.toEqual([]);
      expect(repository.find).toHaveBeenCalledWith({
        where: { user_id: "u1", status: MovieUserStatus.WANT_TO_WATCH },
        relations: ["movie", "movie.platforms"],
      });
    });

    it("blanks user_id on a single result", async () => {
      const repository = getMockRepository("UserMovieRepository");
      repository.find.mockResolvedValue([{ user_id: "u1", movie_id: 1 }]);

      const result = await UserService.getUserMoviesByStatus(
        MovieUserStatus.WANT_TO_WATCH,
        "u1"
      );

      expect(result).toEqual([{ user_id: "", movie_id: 1 }]);
    });

    it("blanks user_id on every result of a multi-item list", async () => {
      const repository = getMockRepository("UserMovieRepository");
      repository.find.mockResolvedValue([
        { user_id: "u1", movie_id: 1 },
        { user_id: "u1", movie_id: 2 },
      ]);

      const result = await UserService.getUserMoviesByStatus(
        MovieUserStatus.WANT_TO_WATCH,
        "u1"
      );

      expect(result).toEqual([
        { user_id: "", movie_id: 1 },
        { user_id: "", movie_id: 2 },
      ]);
    });
  });

  describe("setMovieStatusWatchedLiked", () => {
    it("creates a UserMovie, merges tag points and returns undefined when no achievement matches the movie's tags", async () => {
      const userMovieRepo = getMockRepository("UserMovieRepository");
      const movieTagRepo = getMockRepository("MovieTagRepository");
      const userTagRepo = getMockRepository("UserTagRepository");
      const achievementRepo = getMockRepository("AchievementRepository");

      userMovieRepo.findOne.mockResolvedValue(undefined);

      // movie has tag 1 (weight 5) and tag 2 (weight 3)
      movieTagRepo.queryBuilder.getMany.mockResolvedValueOnce([
        { tag_id: 1, weight: 5 },
        { tag_id: 2, weight: 3 },
      ]);
      // user already tracks tag 1 (matched -> point bump) and tag 99 (not on the
      // movie -> `if (actualmovie_tag)` false branch, left untouched)
      userTagRepo.queryBuilder.getMany.mockResolvedValueOnce([
        { tag_id: 1, total_point: 10 },
        { tag_id: 99, total_point: 1 },
      ]);
      // achievementRepository default getMany() resolves [] -> setAchievementProgress
      // takes its early-return branch (achievementsByMovie.length === 0)

      const result = await UserService.setMovieStatusWatchedLiked(
        "10",
        "u1",
        MovieUserStatus.WATCHED_AND_LIKED
      );

      expect(result).toBeUndefined();
      expect(userMovieRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          movie_id: 10,
          user_id: "u1",
          status: MovieUserStatus.WATCHED_AND_LIKED,
        })
      );

      const savedUserTags = userTagRepo.save.mock.calls[0][0];
      // tag 1 matched the movie's tag -> total_point bumped by its weight (5)
      expect(savedUserTags).toContainEqual(
        expect.objectContaining({ tag_id: 1, total_point: 15 })
      );
      // tag 99 has no counterpart on the movie -> untouched
      expect(savedUserTags).toContainEqual(
        expect.objectContaining({ tag_id: 99, total_point: 1 })
      );
      // tag 2 is new to the user -> created with the movie tag's weight as its point total
      expect(savedUserTags).toContainEqual(
        expect.objectContaining({ tag_id: 2, user_id: "u1", total_point: 3 })
      );
      expect(achievementRepo.queryBuilder.getMany).toHaveBeenCalledTimes(1);
    });

    it("updates the status of an existing UserMovie", async () => {
      const userMovieRepo = getMockRepository("UserMovieRepository");
      const existing = {
        movie_id: 10,
        user_id: "u1",
        status: MovieUserStatus.WANT_TO_WATCH,
      };
      userMovieRepo.findOne.mockResolvedValue(existing);

      await UserService.setMovieStatusWatchedLiked(
        "10",
        "u1",
        MovieUserStatus.WATCHED_AND_LIKED
      );

      expect(userMovieRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: MovieUserStatus.WATCHED_AND_LIKED })
      );
    });

    it("embeds the movie-tag subquery directly in the IN-clause", async () => {
      const userMovieRepo = getMockRepository("UserMovieRepository");
      const movieTagRepo = getMockRepository("MovieTagRepository");
      const userTagRepo = getMockRepository("UserTagRepository");
      const achievementRepo = getMockRepository("AchievementRepository");

      userMovieRepo.findOne.mockResolvedValue(undefined);
      // one getSql() call happens inside setuser_tags, a second inside
      // setAchievementProgress - both share the same MovieTagRepository query builder
      movieTagRepo.queryBuilder.getQuery
        .mockReturnValueOnce(
          `SELECT tag_id FROM movie_tag WHERE "movie_tag"."movie_id" = :movie_id`
        )
        .mockReturnValueOnce(
          `SELECT tag_id FROM movie_tag WHERE "movie_tag"."movie_id" = :movie_id`
        );

      await UserService.setMovieStatusWatchedLiked(
        "10",
        "u1",
        MovieUserStatus.WATCHED_AND_LIKED
      );

      // A subquery returning no rows already matches nothing, so there is no
      // "-1" placeholder to fall back to.
      // the subquery keeps its :movie_id placeholder, so the outer query has to
      // bind that same parameter for the embedded SQL to resolve
      expect(
        userTagRepo.queryBuilder.where
      ).toHaveBeenCalledWith(
        `"user_tag"."tag_id" IN (SELECT tag_id FROM movie_tag WHERE "movie_tag"."movie_id" = :movie_id)`,
        { movie_id: "10" }
      );
      expect(
        achievementRepo.queryBuilder.where
      ).toHaveBeenCalledWith(
        `"user_achievement"."tag_id" IN (SELECT tag_id FROM movie_tag WHERE "movie_tag"."movie_id" = :movie_id)`,
        { movie_id: "10" }
      );
    });
  });

  describe("setMovieStatusWatchedDisliked", () => {
    it("creates a UserMovie when none exists yet", async () => {
      const userMovieRepo = getMockRepository("UserMovieRepository");
      userMovieRepo.findOne.mockResolvedValue(undefined);

      const result = await UserService.setMovieStatusWatchedDisliked(
        "10",
        "u1",
        MovieUserStatus.WATCHED_AND_DISLIKED
      );

      expect(result).toBeUndefined();
      expect(userMovieRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          movie_id: 10,
          user_id: "u1",
          status: MovieUserStatus.WATCHED_AND_DISLIKED,
        })
      );
    });

    it("decreases tag points when switching from WATCHED_AND_LIKED", async () => {
      const userMovieRepo = getMockRepository("UserMovieRepository");
      const movieTagRepo = getMockRepository("MovieTagRepository");
      const userTagRepo = getMockRepository("UserTagRepository");

      const existing = {
        movie_id: 10,
        user_id: "u1",
        status: MovieUserStatus.WATCHED_AND_LIKED,
      };
      userMovieRepo.findOne.mockResolvedValue(existing);

      movieTagRepo.queryBuilder.getMany.mockResolvedValueOnce([
        { tag_id: 1, weight: 5 },
        { tag_id: 2, weight: 20 },
      ]);
      userTagRepo.queryBuilder.getMany.mockResolvedValueOnce([
        { tag_id: 1, total_point: 10 }, // 10 - 5 = 5 -> stays, gets updated
        { tag_id: 2, total_point: 15 }, // 15 - 20 = -5 <= 0 -> removed
        { tag_id: 3, total_point: 7 }, // no matching movie tag -> untouched, not saved/removed
      ]);

      await UserService.setMovieStatusWatchedDisliked(
        "10",
        "u1",
        MovieUserStatus.WATCHED_AND_DISLIKED
      );

      expect(userTagRepo.save).toHaveBeenCalledWith([
        expect.objectContaining({ tag_id: 1, total_point: 5 }),
      ]);
      expect(userTagRepo.remove).toHaveBeenCalledWith([
        expect.objectContaining({ tag_id: 2, total_point: -5 }),
      ]);
      expect(userMovieRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: MovieUserStatus.WATCHED_AND_DISLIKED,
        })
      );
    });

    it("embeds the movie-tag subquery directly in the IN-clause", async () => {
      const userMovieRepo = getMockRepository("UserMovieRepository");
      const movieTagRepo = getMockRepository("MovieTagRepository");
      const userTagRepo = getMockRepository("UserTagRepository");

      const existing = {
        movie_id: 10,
        user_id: "u1",
        status: MovieUserStatus.WATCHED_AND_LIKED,
      };
      userMovieRepo.findOne.mockResolvedValue(existing);
      movieTagRepo.queryBuilder.getQuery.mockReturnValueOnce(
        `SELECT tag_id FROM movie_tag WHERE "movie_tag"."movie_id" = :movie_id`
      );

      await UserService.setMovieStatusWatchedDisliked(
        "10",
        "u1",
        MovieUserStatus.WATCHED_AND_DISLIKED
      );

      expect(
        userTagRepo.queryBuilder.where
      ).toHaveBeenCalledWith(
        `"user_tag"."tag_id" IN (SELECT tag_id FROM movie_tag WHERE "movie_tag"."movie_id" = :movie_id)`,
        { movie_id: 10 }
      );
    });

    it("does not decrease tag points for any other previous status", async () => {
      const userMovieRepo = getMockRepository("UserMovieRepository");
      const userTagRepo = getMockRepository("UserTagRepository");
      const existing = {
        movie_id: 10,
        user_id: "u1",
        status: MovieUserStatus.WANT_TO_WATCH,
      };
      userMovieRepo.findOne.mockResolvedValue(existing);

      await UserService.setMovieStatusWatchedDisliked(
        "10",
        "u1",
        MovieUserStatus.WATCHED_AND_DISLIKED
      );

      expect(userTagRepo.queryBuilder.getMany).not.toHaveBeenCalled();
      expect(userMovieRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: MovieUserStatus.WATCHED_AND_DISLIKED,
        })
      );
    });
  });

  describe("setMovieStatusDontWantWatch", () => {
    it("creates a UserMovie when none exists", async () => {
      const repository = getMockRepository("UserMovieRepository");
      repository.findOne.mockResolvedValue(undefined);
      repository.save.mockImplementation(async (u) => u);

      const result = await UserService.setMovieStatusDontWantWatch(
        "10",
        "u1",
        MovieUserStatus.DONT_WANT_TO_WATCH
      );

      expect(result).toMatchObject({
        movie_id: 10,
        user_id: "u1",
        status: MovieUserStatus.DONT_WANT_TO_WATCH,
      });
    });

    it("updates the status of an existing UserMovie", async () => {
      const repository = getMockRepository("UserMovieRepository");
      const existing = {
        movie_id: 10,
        user_id: "u1",
        status: MovieUserStatus.WANT_TO_WATCH,
      };
      repository.findOne.mockResolvedValue(existing);
      repository.save.mockImplementation(async (u) => u);

      const result = await UserService.setMovieStatusDontWantWatch(
        "10",
        "u1",
        MovieUserStatus.DONT_WANT_TO_WATCH
      );

      expect(result).toMatchObject({
        status: MovieUserStatus.DONT_WANT_TO_WATCH,
      });
    });
  });

  describe("setMovieStatusWantToWatch", () => {
    it("creates a UserMovie when none exists", async () => {
      const repository = getMockRepository("UserMovieRepository");
      repository.findOne.mockResolvedValue(undefined);
      repository.save.mockImplementation(async (u) => u);

      const result = await UserService.setMovieStatusWantToWatch(
        "10",
        "u1",
        MovieUserStatus.WANT_TO_WATCH
      );

      expect(result).toMatchObject({
        movie_id: 10,
        user_id: "u1",
        status: MovieUserStatus.WANT_TO_WATCH,
      });
    });

    it("updates the status of an existing UserMovie", async () => {
      const repository = getMockRepository("UserMovieRepository");
      const existing = {
        movie_id: 10,
        user_id: "u1",
        status: MovieUserStatus.DONT_WANT_TO_WATCH,
      };
      repository.findOne.mockResolvedValue(existing);
      repository.save.mockImplementation(async (u) => u);

      const result = await UserService.setMovieStatusWantToWatch(
        "10",
        "u1",
        MovieUserStatus.WANT_TO_WATCH
      );

      expect(result).toMatchObject({ status: MovieUserStatus.WANT_TO_WATCH });
    });
  });

  describe("deleteUserMovie", () => {
    it("returns undefined when no UserMovie exists", async () => {
      const repository = getMockRepository("UserMovieRepository");
      repository.findOne.mockResolvedValue(undefined);

      await expect(
        UserService.deleteUserMovie("10", "u1")
      ).resolves.toBeUndefined();
      expect(repository.remove).not.toHaveBeenCalled();
    });

    it("decreases tag points and achievement progress for a WATCHED_AND_LIKED movie, then removes it", async () => {
      const userMovieRepo = getMockRepository("UserMovieRepository");
      const movieTagRepo = getMockRepository("MovieTagRepository");
      const userTagRepo = getMockRepository("UserTagRepository");
      const achievementRepo = getMockRepository("AchievementRepository");
      const userAchievementRepo = getMockRepository(
        "UserAchievementRepository"
      );

      const existing = {
        movie_id: 10,
        user_id: "u1",
        status: MovieUserStatus.WATCHED_AND_LIKED,
      };
      userMovieRepo.findOne.mockResolvedValue(existing);
      userMovieRepo.remove.mockImplementation(async (u) => u);

      movieTagRepo.queryBuilder.getMany.mockResolvedValueOnce([
        { tag_id: 1, weight: 5 },
      ]);
      userTagRepo.queryBuilder.getMany.mockResolvedValueOnce([
        { tag_id: 1, total_point: 10 },
      ]);

      achievementRepo.queryBuilder.getMany.mockResolvedValueOnce([
        { id: 1 },
        { id: 2 },
      ]);
      userAchievementRepo.queryBuilder.getMany.mockResolvedValueOnce([
        { achievement_id: 1, current_score: 1 }, // 1 - 1 = 0 -> removed
        { achievement_id: 2, current_score: 5 }, // 5 - 1 = 4 -> updated
      ]);

      const result = await UserService.deleteUserMovie("10", "u1");

      expect(result).toEqual(existing);
      expect(userTagRepo.save).toHaveBeenCalledWith([
        expect.objectContaining({ tag_id: 1, total_point: 5 }),
      ]);
      expect(userAchievementRepo.save).toHaveBeenCalledWith([
        expect.objectContaining({ achievement_id: 2, current_score: 4 }),
      ]);
      expect(userAchievementRepo.remove).toHaveBeenCalledWith([
        expect.objectContaining({ achievement_id: 1, current_score: 0 }),
      ]);
      expect(userMovieRepo.remove).toHaveBeenCalledWith(existing);
    });

    it("embeds the movie-tag subquery in the achievement IN-clause", async () => {
      const userMovieRepo = getMockRepository("UserMovieRepository");
      const movieTagRepo = getMockRepository("MovieTagRepository");
      const achievementRepo = getMockRepository("AchievementRepository");

      const existing = {
        movie_id: 10,
        user_id: "u1",
        status: MovieUserStatus.WATCHED_AND_LIKED,
      };
      userMovieRepo.findOne.mockResolvedValue(existing);
      userMovieRepo.remove.mockImplementation(async (u) => u);
      // 1st getSql() call is inside decreaseuser_tagPoints, 2nd inside
      // decreaseUserAchievementsPoint - both share the MovieTagRepository query builder
      movieTagRepo.queryBuilder.getQuery
        .mockReturnValueOnce("SELECT 1")
        .mockReturnValueOnce(
          `SELECT tag_id FROM movie_tag WHERE "movie_tag"."movie_id" = :movie_id`
        );

      await UserService.deleteUserMovie("10", "u1");

      expect(
        achievementRepo.queryBuilder.where
      ).toHaveBeenCalledWith(
        `"user_achievement"."tag_id" IN (SELECT tag_id FROM movie_tag WHERE "movie_tag"."movie_id" = :movie_id)`,
        { movie_id: "10" }
      );
    });

    it("decreases only achievement progress (not tag points) for a WATCHED_AND_DISLIKED movie", async () => {
      const userMovieRepo = getMockRepository("UserMovieRepository");
      const movieTagRepo = getMockRepository("MovieTagRepository");
      const userTagRepo = getMockRepository("UserTagRepository");

      const existing = {
        movie_id: 10,
        user_id: "u1",
        status: MovieUserStatus.WATCHED_AND_DISLIKED,
      };
      userMovieRepo.findOne.mockResolvedValue(existing);
      userMovieRepo.remove.mockImplementation(async (u) => u);

      const result = await UserService.deleteUserMovie("10", "u1");

      expect(result).toEqual(existing);
      // decreaseuser_tagPoints is only called for WATCHED_AND_LIKED
      expect(movieTagRepo.queryBuilder.getMany).not.toHaveBeenCalled();
      expect(userTagRepo.queryBuilder.getMany).not.toHaveBeenCalled();
      expect(userMovieRepo.remove).toHaveBeenCalledWith(existing);
    });

    it("removes the UserMovie directly for any other status", async () => {
      const userMovieRepo = getMockRepository("UserMovieRepository");
      const achievementRepo = getMockRepository("AchievementRepository");
      const existing = {
        movie_id: 10,
        user_id: "u1",
        status: MovieUserStatus.WANT_TO_WATCH,
      };
      userMovieRepo.findOne.mockResolvedValue(existing);
      userMovieRepo.remove.mockImplementation(async (u) => u);

      const result = await UserService.deleteUserMovie("10", "u1");

      expect(result).toEqual(existing);
      expect(achievementRepo.queryBuilder.getMany).not.toHaveBeenCalled();
      expect(userMovieRepo.remove).toHaveBeenCalledWith(existing);
    });
  });

  describe("setSignUpPreferences", () => {
    it("creates a UserTag with a hardcoded 50-point total for each tag id", async () => {
      const repository = getMockRepository("UserTag");
      repository.save.mockImplementation(async (u) => u);

      const result = await UserService.setSignUpPreferences("u1", [1, 2]);

      expect(result).toEqual([
        expect.objectContaining({ tag_id: 1, user_id: "u1", total_point: 50 }),
        expect.objectContaining({ tag_id: 2, user_id: "u1", total_point: 50 }),
      ]);
    });

    it("saves an empty list when given no tag ids", async () => {
      const repository = getMockRepository("UserTag");
      repository.save.mockImplementation(async (u) => u);

      await expect(UserService.setSignUpPreferences("u1", [])).resolves.toEqual(
        []
      );
      expect(repository.save).toHaveBeenCalledWith([]);
    });
  });

  describe("setAchievementProgress", () => {
    it("returns undefined when the movie has no achievement-linked tags", async () => {
      const achievementRepo = getMockRepository("AchievementRepository");
      achievementRepo.queryBuilder.getMany.mockResolvedValueOnce([]);

      await expect(
        UserService.setAchievementProgress("10", "u1")
      ).resolves.toBeUndefined();
    });

    it("creates new progress for an unseen achievement and completes one that reaches its target", async () => {
      const achievementRepo = getMockRepository("AchievementRepository");
      const userAchievementRepo = getMockRepository(
        "UserAchievementRepository"
      );

      // achievement 1: user already has progress that reaches target after +1
      // achievement 2: user has no progress yet -> created fresh
      achievementRepo.queryBuilder.getMany
        .mockResolvedValueOnce([
          { id: 1, target_score: 2 },
          { id: 2, target_score: 5 },
        ])
        .mockResolvedValueOnce([{ id: 1, target_score: 2 }]); // final achievementsById lookup

      userAchievementRepo.queryBuilder.getMany.mockResolvedValueOnce([
        { achievement_id: 1, current_score: 1, user_id: "u1" },
      ]);

      const result = await UserService.setAchievementProgress("10", "u1");

      expect(result).toEqual([{ id: 1, target_score: 2 }]);

      const savedMap = userAchievementRepo.save.mock.calls[0][0];
      expect(savedMap).toContainEqual(
        expect.objectContaining({ achievement_id: 1, current_score: 2 })
      );
      expect(savedMap).toContainEqual(
        expect.objectContaining({
          achievement_id: 2,
          current_score: 1,
          user_id: "u1",
        })
      );
    });

    it("does not report completion when the achievement was already at or beyond target", async () => {
      const achievementRepo = getMockRepository("AchievementRepository");
      const userAchievementRepo = getMockRepository(
        "UserAchievementRepository"
      );

      achievementRepo.queryBuilder.getMany.mockResolvedValueOnce([
        { id: 1, target_score: 2 },
      ]);
      userAchievementRepo.queryBuilder.getMany.mockResolvedValueOnce([
        { achievement_id: 1, current_score: 5, user_id: "u1" },
      ]);

      const result = await UserService.setAchievementProgress("10", "u1");

      // target_score (2) is not greater than current_score (5): `changed` stays false,
      // so the boundary check short-circuits and nothing is reported even though the
      // score still gets incremented.
      expect(result).toBeUndefined();
      expect(userAchievementRepo.save).toHaveBeenCalledWith([
        expect.objectContaining({ achievement_id: 1, current_score: 6 }),
      ]);
      // the final achievementsById lookup is only reached when something completed
      expect(achievementRepo.queryBuilder.getMany).toHaveBeenCalledTimes(1);
    });

    it("reports an achievement whose target is reached by the very first movie", async () => {
      const achievementRepo = getMockRepository("AchievementRepository");
      const userAchievementRepo = getMockRepository(
        "UserAchievementRepository"
      );

      // target_score 1 means the freshly created progress (current_score 1) is
      // already complete; this used to be saved but never reported to the caller.
      achievementRepo.queryBuilder.getMany
        .mockResolvedValueOnce([{ id: 7, target_score: 1 }])
        .mockResolvedValueOnce([{ id: 7, target_score: 1 }]);
      userAchievementRepo.queryBuilder.getMany.mockResolvedValueOnce([]);

      const result = await UserService.setAchievementProgress("10", "u1");

      expect(result).toEqual([{ id: 7, target_score: 1 }]);
      expect(userAchievementRepo.save).toHaveBeenCalledWith([
        expect.objectContaining({
          achievement_id: 7,
          current_score: 1,
          user_id: "u1",
        }),
      ]);
    });

    it("does not report a newly created achievement that is still short of its target", async () => {
      const achievementRepo = getMockRepository("AchievementRepository");
      const userAchievementRepo = getMockRepository(
        "UserAchievementRepository"
      );

      achievementRepo.queryBuilder.getMany.mockResolvedValueOnce([
        { id: 8, target_score: 3 },
      ]);
      userAchievementRepo.queryBuilder.getMany.mockResolvedValueOnce([]);

      const result = await UserService.setAchievementProgress("10", "u1");

      expect(result).toBeUndefined();
    });
  });
});
