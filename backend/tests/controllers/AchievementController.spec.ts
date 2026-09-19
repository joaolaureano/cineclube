import express from "express";
import { AchievementController } from "../../src/controllers/AchievementController";
import AchievementService from "../../src/services/AchievementService";

jest.mock("../../src/services/AchievementService");

const mockedAchievementService = AchievementService as jest.Mocked<
  typeof AchievementService
>;

const buildRequest = (user?: { id: string }) =>
  (({ user } as unknown) as express.Request);

describe("AchievementController", () => {
  describe("getAll", () => {
    it("returns every achievement with 200", async () => {
      const achievements = [{ id: 1, name: "First movie" }];
      mockedAchievementService.getAll.mockResolvedValue(achievements as any);

      const controller = new AchievementController();
      const result = await controller.getAll();

      expect(result).toEqual({
        success: true,
        message: "Found 1 achievements.",
        body: { achievements },
      });
      expect(controller.getStatus()).toBe(200);
    });

    it("throws when the service resolves falsy, landing in the catch/500 branch", async () => {
      mockedAchievementService.getAll.mockResolvedValue(undefined as any);

      const controller = new AchievementController();
      const result = await controller.getAll();

      expect(result.success).toBe(false);
      expect(controller.getStatus()).toBe(500);
    });

    it("returns 500 with the error message when the service rejects", async () => {
      mockedAchievementService.getAll.mockRejectedValue(new Error("db down"));

      const controller = new AchievementController();
      const result = await controller.getAll();

      expect(result).toEqual({
        success: false,
        message: "Internal server error.",
        details: "db down",
      });
      expect(controller.getStatus()).toBe(500);
    });
  });

  describe("getUserAchievements", () => {
    it("returns the user's achievements with 200", async () => {
      const achievements = [{ id: 2, name: "Ten movies" }];
      mockedAchievementService.getUserAchievements.mockResolvedValue(
        achievements as any
      );

      const controller = new AchievementController();
      const result = await controller.getUserAchievements(
        buildRequest({ id: "user-1" })
      );

      expect(mockedAchievementService.getUserAchievements).toHaveBeenCalledWith(
        "user-1"
      );
      expect(result).toEqual({
        success: true,
        message: "Found 1 achievements.",
        body: { achievements },
      });
      expect(controller.getStatus()).toBe(200);
    });

    it("falls through to the throw/500 branch when there is no user on the request (bug: should be 401, not 500)", async () => {
      const controller = new AchievementController();
      const result = await controller.getUserAchievements(
        buildRequest(undefined)
      );

      expect(
        mockedAchievementService.getUserAchievements
      ).not.toHaveBeenCalled();
      expect(result.success).toBe(false);
      expect(controller.getStatus()).toBe(500);
    });

    it("throws when the service resolves falsy, landing in the catch/500 branch", async () => {
      mockedAchievementService.getUserAchievements.mockResolvedValue(
        undefined as any
      );

      const controller = new AchievementController();
      const result = await controller.getUserAchievements(
        buildRequest({ id: "user-1" })
      );

      expect(result.success).toBe(false);
      expect(controller.getStatus()).toBe(500);
    });

    it("returns 500 with the error message when the service rejects", async () => {
      mockedAchievementService.getUserAchievements.mockRejectedValue(
        new Error("db down")
      );

      const controller = new AchievementController();
      const result = await controller.getUserAchievements(
        buildRequest({ id: "user-1" })
      );

      expect(result).toEqual({
        success: false,
        message: "Internal server error.",
        details: "db down",
      });
      expect(controller.getStatus()).toBe(500);
    });
  });
});
