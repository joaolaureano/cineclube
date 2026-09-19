import { ValidateError } from "tsoa";
import { errorhandler } from "../../src/utils/errorHandler";

type MockResponse = import("express").Response & {
  status: jest.Mock;
  json: jest.Mock;
};

const buildResponse = (): MockResponse => {
  const res: Record<string, jest.Mock> = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return (res as unknown) as MockResponse;
};

describe("errorhandler", () => {
  const req = {} as import("express").Request;

  it("answers a tsoa ValidateError with its own status and the field details", () => {
    const res = buildResponse();
    const next = jest.fn();
    const err = new ValidateError({ name: { message: "required" } }, "invalid");

    errorhandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(err.status);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, fields: err.fields })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("answers a generic Error with 500 and its message", () => {
    const res = buildResponse();
    const next = jest.fn();

    errorhandler(new Error("boom"), req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Internal Server Error",
      errorMessage: "boom",
      success: false,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("answers 500 for a thrown value that is not an Error", () => {
    const res = buildResponse();
    const next = jest.fn();

    errorhandler("just a string", req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Internal Server Error",
      success: false,
    });
    expect(next).not.toHaveBeenCalled();
  });
});
