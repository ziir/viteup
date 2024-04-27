import { describe, expect, it, vi } from "vitest";
import { getEntryPoints } from "../entrypoints.js";

describe("getEntryPoints", () => {
	it("throws if no exports are provided", () => {
		expect(() => getEntryPoints({})).toThrowError(
			"Missing package exports in package.json, unable to determine entry points",
		);
	});

	it("retrieves the Public API Entry Points", () => {
		expect(
			getEntryPoints({
				"./package.json": "./package.json",
				".": {
					source: "./src/index.ts",
					import: {
						types: "./dist/esm/index.d.ts",
						default: "./dist/esm/index.js",
					},
				},
				"./bin": {
					types: "./dist/esm/bin.d.ts",
					source: "./src/bin.ts",
					import: "./dist/esm/bin.js",
					default: "./dist/esm/bin.js",
				},
				"./types": {
					import: {
						types: "./dist/esm/bin.d.ts",
						default: "./empty.js",
					},
				},
				"./more-types": {
					types: "./dist/esm/bin.d.ts",
					default: "./empty.js",
				},
			}),
		).toStrictEqual({
			bin: "./src/bin.ts",
			index: "./src/index.ts",
		});
	});

	it("throws for an entry point with an invalid source field", () => {
		expect(() =>
			getEntryPoints({
				".": {
					source: "",
					import: {
						types: "./dist/esm/index.d.ts",
						default: "./dist/esm/index.js",
					},
				},
			}),
		).toThrowError(
			`Package export "." does not include a valid "source" field with matching source file relative path`,
		);
	});

	it("throws for an entry point with an invalid inner source field", () => {
		expect(() =>
			getEntryPoints({
				".": {
					import: {
						types: "./dist/esm/index.d.ts",
						source: "",
						default: "./dist/esm/index.js",
					},
				},
			}),
		).toThrowError(
			`Package export "." does not include a valid "source" field with matching source file relative path`,
		);
	});

	it("throws for no entry points with a valid source field", () => {
		expect(() =>
			getEntryPoints({
				"./package.json": "./package.json",
				"./types": {
					import: {
						types: "./dist/esm/bin.d.ts",
						default: "./empty.js",
					},
				},
			}),
		).toThrowError(
			`Missing package exports including valid "source" field with matching source file relative path`,
		);
	});
});
