import { HelloWorldController } from "../../src/controllers/HelloWorldController";

describe("HelloWorldController", () => {
  describe("hello", () => {
    it("returns the static greeting payload", () => {
      const controller = new HelloWorldController();

      expect(controller.hello()).toEqual({ message: "Hello World!" });
    });
  });
});
