import path from "node:path";
import { describe, expect, it } from "vitest";
import { readPackageJson } from "viteup/api";

describe("general", () => {
  describe("no package.json", () => {
    it("throws in readPackageJson('path/to/package')", () => {
      expect(() =>
        readPackageJson(path.join(import.meta.dirname, "package")),
      ).toThrowError("Failed to read package.json");
    });
  });
});
