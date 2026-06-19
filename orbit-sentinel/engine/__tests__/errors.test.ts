import { describe, it, expect } from "vitest";
import { GitLabErrorHandler, GitLabErrorCode, ErrorType, ErrorHandler, OrbitSentinelError } from "../src/errors.js";

describe("GitLab Error Handler", () => {
  it("maps 404 error based on context correctly", () => {
    const errProj = GitLabErrorHandler.handleError({ statusCode: 404, message: "Project not found" }, "project");
    expect(errProj.gitLabErrorCode).toBe(GitLabErrorCode.PROJECT_NOT_FOUND);
    expect(errProj.recoveryAction).toContain("project path");

    const errMr = GitLabErrorHandler.handleError({ statusCode: 404, message: "MR not found" }, "mr iid");
    expect(errMr.gitLabErrorCode).toBe(GitLabErrorCode.MR_NOT_FOUND);
    expect(errMr.recoveryAction).toContain("merge request");
  });

  it("maps 403 error to INSUFFICIENT_PERMISSIONS", () => {
    const err = GitLabErrorHandler.handleError({ statusCode: 403, message: "Forbidden" });
    expect(err.gitLabErrorCode).toBe(GitLabErrorCode.INSUFFICIENT_PERMISSIONS);
    expect(err.type).toBe(ErrorType.AUTHENTICATION_ERROR);
    expect(err.recoveryAction).toContain("read_api");
  });

  it("maps 429 error to RATE_LIMIT_EXCEEDED", () => {
    const err = GitLabErrorHandler.handleError({ statusCode: 429, message: "Too Many Requests" });
    expect(err.gitLabErrorCode).toBe(GitLabErrorCode.RATE_LIMIT_EXCEEDED);
    expect(err.type).toBe(ErrorType.RATE_LIMIT);
  });

  it("maps 401 error to TOKEN_INVALID", () => {
    const err = GitLabErrorHandler.handleError({ statusCode: 401, message: "Unauthorized" });
    expect(err.gitLabErrorCode).toBe(GitLabErrorCode.TOKEN_INVALID);
    expect(err.type).toBe(ErrorType.AUTHENTICATION_ERROR);
  });

  it("maps 5xx error to NETWORK_TIMEOUT", () => {
    const err = GitLabErrorHandler.handleError({ statusCode: 503, message: "Service Unavailable" });
    expect(err.gitLabErrorCode).toBe(GitLabErrorCode.NETWORK_TIMEOUT);
    expect(err.type).toBe(ErrorType.NETWORK_ERROR);
  });

  it("handles non-GitLab/generic errors gracefully", () => {
    const err = GitLabErrorHandler.handleError(new Error("Some internal crash"));
    expect(err.gitLabErrorCode).toBeUndefined();
    expect(err.type).toBe(ErrorType.ORBIT_API_ERROR);
  });

  it("extracts error recovery actions", () => {
    const err = GitLabErrorHandler.handleError({ statusCode: 401, message: "Unauthorized" });
    expect(err.recoveryAction).toBeDefined();
    expect(err.recoveryAction).toContain("valid GitLab personal access token");
  });
});

describe("ErrorHandler class with new fields", () => {
  it("preserves mapped fields on OrbitSentinelError", () => {
    const original = new OrbitSentinelError(
      "Direct error",
      ErrorType.AUTHENTICATION_ERROR,
      401,
      undefined,
      undefined,
      GitLabErrorCode.TOKEN_INVALID,
      "Fix your token"
    );
    const handler = ErrorHandler.getInstance();
    const result = handler.handleError(original);
    expect(result.gitLabErrorCode).toBe(GitLabErrorCode.TOKEN_INVALID);
    expect(result.recoveryAction).toBe("Fix your token");
  });
});
