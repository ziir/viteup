import path from "node:path";
import { describe, expect, it, vi, afterAll } from "vitest";
import { readPackageJson } from "viteup/api";

describe("general", () => {
  describe("invalid package.json", () => {
    it("throws in readPackageJson('path/to/package')", () => {
      expect(() =>
        readPackageJson(path.join(import.meta.dirname, "package")),
      ).toThrowError("Failed to read package.json");
    });
  });
});
