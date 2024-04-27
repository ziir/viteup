import path from "node:path";
import { describe, expect, it, vi, afterAll } from "vitest";
import { readPackageJson } from "viteup/pure";

describe("general", () => {
	describe("no package.json", () => {
		const consoleMock = vi.spyOn(console, 'error').mockImplementation(() => {});

		it("throws in readPackageJson('path/to/package')", () => {
			expect(() =>
				readPackageJson(path.join(import.meta.dirname, "package")),
			).toThrowError(/ENOENT: no such file or directory/);

			expect(consoleMock).toHaveBeenCalled();
		});
	});
});
