import { UserService } from "../../src/services";
import UserServiceModule from "../../src/services/UserService";

describe("services barrel", () => {
  // The authentication middleware imports UserService through this barrel, so the
  // re-export has to stay in place even though the other five services bypass it.
  it("re-exports UserService", () => {
    expect(UserService).toBe(UserServiceModule);
  });
});
