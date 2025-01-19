import { describe, expect, it } from "vitest";
import { shouldSkipExport } from "../exports.ts";

describe("shouldSkipExport", () => {
  it('returns false for the "." export', () => {
    expect(shouldSkipExport(".")).toBe(false);
  });

  it("returns true for a non supported source file extension", () => {
    expect(shouldSkipExport("./package.json")).toBe(true);
  });

  it("returns true for a non supported source file extension (alt)", () => {
    expect(shouldSkipExport("package.json")).toBe(true);
  });

  it("returns false for a supported source file extension", () => {
    expect(shouldSkipExport("./foo.js")).toBe(false);
  });

  it("returns false for a supported source file extension (alt)", () => {
    expect(shouldSkipExport("foo.js")).toBe(false);
  });

  it("returns true for a directory export path (w/ a trailing slash)", () => {
    expect(
      shouldSkipExport("./assets-directory-trailing-slash-so-ignored/"),
    ).toBe(true);
  });

  it("returns true for a directory export path (w/ a trailing slash) (alt)", () => {
    expect(
      shouldSkipExport("assets-directory-trailing-slash-so-ignored/"),
    ).toBe(true);
  });
});
