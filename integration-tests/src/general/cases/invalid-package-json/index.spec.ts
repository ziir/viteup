import path from "node:path";
import { describe, expect, it, vi, afterAll } from "vitest";
import { readPackageJson } from "viteup/pure";

describe("general", () => {
	describe("invalid package.json", () => {
		const consoleMock = vi.spyOn(console, 'error').mockImplementation(() => {});

		afterAll(() => {
		  consoleMock.mockReset();
		});

		it("throws in readPackageJson('path/to/package')", () => {
			expect(() =>
				readPackageJson(path.join(import.meta.dirname, "package")),
			).toThrowError(/Expected ',' or '}' after property value in JSON/);

			expect(consoleMock).toHaveBeenCalled();
		});
	});
});
