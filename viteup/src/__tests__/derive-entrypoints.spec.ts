import { describe, expect, it } from "vitest";
import { deriveEntrypoints } from "../derive-entrypoints.js";
import type { PackageFieldEntries } from "../types.js";

describe("deriveEntrypoints", () => {
	describe("when provided a single export with a simple supported condition", () => {
		it("derives exports", () => {
			expect(
				deriveEntrypoints("dist", {
					".": {
						default: "./dist/index.js",
					},
				}),
			).toStrictEqual({
				index: "./src/index",
			});
		});
	});

	describe("when provided a single export with a nested supported condition", () => {
		it("derives exports", () => {
			expect(
				deriveEntrypoints("dist", {
					".": {
						import: {
							default: "./dist/index.js",
						},
					},
				}),
			).toStrictEqual({
				index: "./src/index",
			});
		});
	});

	describe("when provided a single export with a supported condition & an unsupported condition", () => {
		it("derives exports", () => {
			expect(
				deriveEntrypoints("dist", {
					".": {
						require: "./dist/foo.cjs",
						default: "./dist/index.js",
					},
				}),
			).toStrictEqual({
				index: "./src/index",
			});
		});
	});

	describe("when provided a single export with a supported condition & unsupported conditions", () => {
		it("derives exports", () => {
			expect(
				deriveEntrypoints("dist", {
					".": {
						type: "./dist/index.d.ts",
						require: "./dist/index.cjs",
						default: "./dist/index.js",
					},
				}),
			).toStrictEqual({
				index: "./src/index",
			});
		});
	});

	describe("when provided mutliple exports with a common source file name", () => {
		it("derives exports", () => {
			expect(
				deriveEntrypoints("dist", {
					".": {
						default: "./dist/index.js",
					},
					"./foo": {
						default: "./dist/foo/index.js",
					},
				}),
			).toStrictEqual({
				index: "./src/index",
				foo: "./src/foo/index",
			});
		});
	});

	describe("when provided multiple out-of-order exports with a common source file name", () => {
		it("derives exports", () => {
			expect(
				deriveEntrypoints("dist", {
					"./foo": {
						default: "./dist/foo/index.js",
					},
					".": {
						default: "./dist/index.js",
					},
				}),
			).toStrictEqual({
				index: "./src/index",
				foo: "./src/foo/index",
			});
		});
	});

	describe("when provided multiple exports + module with a common source file name", () => {
		it("derives exports", () => {
			expect(
				deriveEntrypoints(
					"./dist",
					{
						".": {
							default: "./dist/index.js",
						},
						"./foo": {
							default: "./dist/foo/index.js",
						},
						"./bar/foo": {
							default: "./dist/bar/foo/index.js",
						},
						"./bar/foo/bar": {
							default: "./dist/bar/foo/bar/index.js",
						},
						"./foo/bar/foo": {
							default: "./dist/foo/bar/foo/index.js",
						},
					},
					{
						module: {
							name: "module",
							value: { ".": "./dist/index.js" },
						},
					},
				),
			).toStrictEqual({
				index: "./src/index",
				foo: "./src/foo/index",
				"bar/foo": "./src/bar/foo/index",
				"bar/foo/bar": "./src/bar/foo/bar/index",
				"foo/bar/foo": "./src/foo/bar/foo/index",
			});
		});
	});

	describe("when provided multiple out-of-order exports + module with a common source file name", () => {
		it("derives exports", () => {
			expect(
				deriveEntrypoints(
					"./dist",
					{
						"./foo": {
							default: "./dist/foo/index.js",
						},
						".": {
							default: "./dist/index.js",
						},
						"./bar/foo": {
							default: "./dist/bar/foo/index.js",
						},
						"./bar/foo/bar": {
							default: "./dist/bar/foo/bar/index.js",
						},
						"./foo/bar/foo": {
							default: "./dist/foo/bar/foo/index.js",
						},
					},
					{
						module: {
							name: "module",
							value: { ".": "./dist/index.js" },
						},
					},
				),
			).toStrictEqual({
				index: "./src/index",
				foo: "./src/foo/index",
				"bar/foo": "./src/bar/foo/index",
				"bar/foo/bar": "./src/bar/foo/bar/index",
				"foo/bar/foo": "./src/foo/bar/foo/index",
			});
		});
	});

	describe("when provided a standard package.json with multiple exports w/ types + default conditions", () => {
		it("derives flat exports", () => {
			expect(
				deriveEntrypoints("dist", {
					"./package.json": "./package.json",
					".": {
						types: "./dist/index.d.ts",
						default: "./dist/index.js",
					},
					"./foo": {
						types: "./dist/foo.d.ts",
						default: "./dist/foo.js",
					},
				}),
			).toStrictEqual({
				index: "./src/index",
				foo: "./src/foo",
			});
		});

		it("derives deep exports", () => {
			expect(
				deriveEntrypoints("./dist/esm", {
					"./package.json": "./package.json",
					".": {
						types: "./dist/types/index.d.ts",
						default: "./dist/esm/index.js",
					},
					"./foo": {
						types: "./dist/types/foo.d.ts",
						default: "./dist/esm/foo.js",
					},
				}),
			).toStrictEqual({
				index: "./src/index",
				foo: "./src/foo",
			});
		});

		it("ignores non-supported conditions", () => {
			expect(
				deriveEntrypoints("./dist/esm", {
					"./package.json": "./package.json",
					".": {
						types: "./dist/types/index.d.ts",
						source: "./not-supported.ts",
						default: "./dist/esm/index.js",
					},
					"./foo": {
						types: "./dist/types/foo.d.ts",
						default: "./dist/esm/foo.js",
					},
				}),
			).toStrictEqual({
				index: "./src/index",
				foo: "./src/foo",
			});
		});

		it("throws for no supported export conditions", () => {
			expect(() =>
				deriveEntrypoints("dist", {
					"./package.json": "./package.json",
					".": {
						types: "./dist/types/index.d.ts",
						require: "./dist/esm/index.js",
					},
				}),
			).toThrowError("Unable to determine entry points");
		});

		it("throws for no exports, nor 'bin' or 'module' entries", () => {
			expect(() =>
				deriveEntrypoints("./impossible", {}, {} as PackageFieldEntries),
			).toThrowError("Unable to determine entry points");
		});

		it("acknowledges 'bin' & 'module' entries", () => {
			expect(
				deriveEntrypoints(
					"./dist",
					{},
					{
						module: {
							name: "module",
							value: {
								".": "./dist/foo.js",
							},
						},
						bin: {
							name: "bin",
							value: {
								viteup: "./dist/viteup.js",
							},
						},
					},
				),
			).toStrictEqual({
				foo: "./src/foo",
				viteup: "./src/viteup",
			});
		});

		it("dedupes 'module' entry with '.' export", () => {
			expect(
				deriveEntrypoints(
					"./dist",
					{
						".": {
							types: "./dist/index.d.ts",
							default: "./dist/index.js",
						},
					},
					{
						module: {
							name: "module",
							value: {
								".": "./dist/index.js",
							},
						},
					},
				),
			).toStrictEqual({
				index: "./src/index",
			});
		});

		it("treats 'module' entry & '.' export as separate entrypoints", () => {
			expect(
				deriveEntrypoints(
					"dist",
					{
						".": {
							types: "./dist/index.d.ts",
							default: "./dist/index.js",
						},
					},
					{
						module: {
							name: "module",
							value: {
								".": "./dist/module.js",
							},
						},
					},
				),
			).toStrictEqual({
				index: "./src/index",
				module: "./src/module",
			});
		});

		it("throws for a super invalid import / module (ESM) supported export condition", () => {
			expect(() =>
				deriveEntrypoints("impossible", {
					// @ts-expect-error
					".": {
						import: 1,
						module: 2,
						default: 3,
					},
				}),
			).toThrowError(
				'Package export "." does not include a valid "import" conditional value',
			);
		});

		it("throws for a super invalid import / module (ESM) supported export condition", () => {
			expect(
				deriveEntrypoints("dist", {
					".": {
						module: "./dist/module.js",
						import: "./dist/import.js",
						default: "./dist/default.js",
					},
				}),
			).toStrictEqual({
				module: "./src/module",
				import: "./src/import",
				default: "./src/default",
			});
		});

		it("throws for a super invalid export", () => {
			expect(() =>
				deriveEntrypoints("dist", {
					".": null,
				}),
			).toThrowError(
				'Package export "." does not include a valid conditional value',
			);
		});
	});
});
