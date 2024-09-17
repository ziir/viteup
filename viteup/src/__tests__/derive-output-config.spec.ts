import { describe, expect, it } from "vitest";
import { deriveOutputConfig } from "../derive-output-config.js";
import type { PackageFieldEntries } from "../types.js";

describe("deriveOutputConfig", () => {
	describe.each([
		{ packageType: "commonjs" },
		{ packageType: "module" },
	] as const)("for a given package type: $packageType", ({ packageType }) => {
		describe("when no exports / package field entries are provided", () => {
			it("throws", () => {
				expect(() =>
					deriveOutputConfig({}, packageType, {} as PackageFieldEntries),
				).toThrowError(
					"Unable to determine output directory from package.json exports.",
				);
			});
		});

		describe("when no usable & supported exports / package field entries are provided", () => {
			it("derives output config for a require (CJS) export condition", () => {
				expect(
					deriveOutputConfig(
						{
							".": {
								require: "./dist/index.js",
							},
						},
						packageType,
						{} as PackageFieldEntries,
					),
				).toStrictEqual({
					commonjs: true,
					outDir: "dist",
				});
			});

			it("throws for an array of exports", () => {
				expect(() =>
					deriveOutputConfig(
						["./dist/index.js"],
						packageType,
						{} as PackageFieldEntries,
					),
				).toThrowError("Package exports of type Array is not yet supported");
			});

			it('throws for "null" default / import / module (ESM) supported export condition', () => {
				expect(() =>
					deriveOutputConfig(
						{
							".": {
								import: null,
								module: null,
								default: null,
							},
						},
						packageType,
						{} as PackageFieldEntries,
					),
				).toThrowError(
					"Unable to determine output directory from package.json exports.",
				);
			});

			it("throws for invalid import / module (ESM) supported export condition", () => {
				expect(() =>
					deriveOutputConfig(
						{
							".": {
								import: ["dist/index.js"],
								module: ["dist/index.js"],
								default: ["dist/index.js"],
							},
						},
						packageType,
						{} as PackageFieldEntries,
					),
				).toThrowError(
					"Unable to determine output directory from package.json exports.",
				);
			});

			it("throws for invalid import / module (ESM) supported export condition", () => {
				expect(() =>
					deriveOutputConfig(
						{
							".": {
								import: {},
								module: {},
								default: {},
							},
						},
						packageType,
						{} as PackageFieldEntries,
					),
				).toThrowError(
					"Unable to determine output directory from package.json exports.",
				);
			});

			it("throws for a super invalid import / module (ESM) supported export condition", () => {
				expect(() =>
					deriveOutputConfig(
						// @ts-expect-error
						{
							".": {
								import: 1,
								module: 2,
								default: 3,
							},
						},
						packageType,
						{} as PackageFieldEntries,
					),
				).toThrowError(
					'Package export "." does not include a valid "import" conditional value',
				);
			});

			it("throws for a super invalid export", () => {
				expect(() =>
					deriveOutputConfig(
						{
							".": null,
						},
						packageType,
						{} as PackageFieldEntries,
					),
				).toThrowError(
					'Package export "." does not include a valid conditional value',
				);
			});

			it("throws for invalid import / module (ESM) supported export condition", () => {
				expect(() =>
					deriveOutputConfig(
						{
							".": {
								import: "",
								module: "",
								default: "",
							},
						},
						packageType,
						{} as PackageFieldEntries,
					),
				).toThrowError(
					`Package export "." does not include a valid "import" conditional value`,
				);
			});

			it("ignores some common valid exports (JSON, CSS)", () => {
				expect(
					deriveOutputConfig(
						{
							".": {
								default: "./dist/index.js",
							},
							"./lib/*.json": "./lib/*.json",
							"./lib/*.css": "./lib/*.css",
						},
						packageType,
						{} as PackageFieldEntries,
					),
				).toStrictEqual({
					outDir: "dist",
					[packageType]: true,
				});
			});
		});

		describe("when exports exhibit different, non-overlapping output directories", () => {
			it("throws", () => {
				expect(() =>
					deriveOutputConfig(
						{
							".": {
								default: "./dist/index.js",
							},
							"./foo": {
								default: "./build/foo.js",
							},
						},
						packageType,
						{} as PackageFieldEntries,
					),
				).toThrowError(
					'Package export "./foo" exhibits an incompatible output directory',
				);
			});
		});

		describe("when exports match our assumptions", () => {
			it("derives the normalized output directory for a single string export", () => {
				expect(
					deriveOutputConfig(
						"./dist/index.js",
						packageType,
						{} as PackageFieldEntries,
					),
				).toStrictEqual({
					outDir: "dist",
					[packageType]: true,
				});
			});

			it('derives the normalized output directory for a trivial single "." short-hand export', () => {
				expect(
					deriveOutputConfig(
						{
							".": "./dist/index.js",
						},
						packageType,
						{} as PackageFieldEntries,
					),
				).toStrictEqual({
					outDir: "dist",
					[packageType]: true,
				});
			});

			it('derives the normalized output directory for a trivial single "." export', () => {
				expect(
					deriveOutputConfig(
						{
							".": {
								default: "./dist/index.js",
							},
						},
						packageType,
						{} as PackageFieldEntries,
					),
				).toStrictEqual({
					outDir: "dist",
					[packageType]: true,
				});
			});

			it("determines ambiguous module format based on extension", () => {
				expect(
					deriveOutputConfig(
						{
							".": {
								default: "./dist/index.mjs",
							},
						},
						packageType,
						{} as PackageFieldEntries,
					),
				).toStrictEqual({
					outDir: "dist",
					module: true,
				});
			});

			it('derives the normalized output directory for a deep single "." export', () => {
				expect(
					deriveOutputConfig(
						{
							".": {
								default: `./dist/${packageType}/index.js`,
							},
						},
						packageType,
						{} as PackageFieldEntries,
					),
				).toStrictEqual({
					outDir: `dist/${packageType}`,
					[packageType]: true,
				});
			});

			it("derives the normalized output directory for multiple simple exports", () => {
				expect(
					deriveOutputConfig(
						{
							".": {
								default: "./dist/index.js",
							},
							"./foo": {
								default: "./dist/foo.js",
							},
						},
						packageType,
						{} as PackageFieldEntries,
					),
				).toStrictEqual({
					outDir: "dist",
					[packageType]: true,
				});
			});

			it("derives the normalized output directory for multiple complex exports", () => {
				expect(
					deriveOutputConfig(
						{
							".": {
								default: "./dist/lib/index.js",
							},
							"./foo": {
								import: "./dist/lib/foo/bar.js",
							},
							"./foo/bar": {
								module: "./dist/lib/foo/bar.js",
							},
							"./bar": {
								require: null,
								types: "./dist/types/bar.d.ts",
								default: "./dist/lib/bar.js",
							},
						},
						packageType,
						{} as PackageFieldEntries,
					),
				).toStrictEqual({
					outDir: "dist/lib",
					module: true,
					...(packageType === "commonjs" && { commonjs: true }),
				});
			});
		});

		describe("when package fields match our assumptions", () => {
			it('derives the normalized output directory for a "module" field', () => {
				expect(
					deriveOutputConfig({}, packageType, {
						module: {
							name: "module",
							value: {
								".": {
									value: "./dist/index.js",
									type: "module",
								},
							},
						},
					}),
				).toStrictEqual({
					outDir: "dist",
					module: true,
				});
			});

			it('ignores ".json" exports', () => {
				expect(
					deriveOutputConfig(
						{
							"./package.json": "./package.json",
							".": {
								default: "./dist/index.js",
							},
						},
						packageType,
						{} as PackageFieldEntries,
					),
				).toStrictEqual({
					outDir: "dist",
					[packageType]: true,
				});
			});

			it('derives the normalized output directory for a "bin" field', () => {
				expect(
					deriveOutputConfig({}, packageType, {
						bin: {
							name: "bin",
							value: {
								type: packageType,
								value: {
									"awesome-bin": "./dist/bin.js",
								},
							},
						},
					}),
				).toStrictEqual({
					outDir: "dist",
					[packageType]: true,
				});
			});

			it('derives the normalized output directory for "module" + "bin" field', () => {
				expect(
					deriveOutputConfig({}, packageType, {
						module: {
							name: "module",
							value: {
								".": {
									type: "module",
									value: "./dist/index.js",
								},
							},
						},
						bin: {
							name: "bin",
							value: {
								type: packageType,
								value: { "awesome-bin": "./dist/bin.js" },
							},
						},
					}),
				).toStrictEqual({
					outDir: "dist",
					module: true,
					...(packageType === "commonjs" && { commonjs: true }),
				});
			});

			it('derives the deep normalized output directory for "module" + "bin" field', () => {
				expect(
					deriveOutputConfig({}, packageType, {
						module: {
							name: "module",
							value: {
								".": {
									type: "module",
									value: "./dist/lib/index.js",
								},
							},
						},
						bin: {
							name: "bin",
							value: {
								type: packageType,
								value: {
									"awesome-bin": "./dist/lib/bin/index.js",
								},
							},
						},
					}),
				).toStrictEqual({
					outDir: "dist/lib",
					module: true,
					...(packageType === "commonjs" && { commonjs: true }),
				});
			});
		});

		describe("when package fields exhibit different, non-overlapping output directories", () => {
			it("throws", () => {
				expect(() =>
					deriveOutputConfig({}, packageType, {
						module: {
							name: "module",
							value: {
								".": {
									type: "module",
									value: "./dist/index.js",
								},
							},
						},
						bin: {
							name: "bin",
							value: {
								type: packageType,
								value: { "not-so-awesome-bin": "./build/index.js" },
							},
						},
					}),
				).toThrowError(
					'Package field "bin" exhibits an incompatible output directory',
				);
			});
		});

		describe("when a package field exhibit different a different output directoriy than derived from exports", () => {
			it("throws", () => {
				expect(() =>
					deriveOutputConfig(
						{
							".": {
								default: "./dist/index.js",
							},
						},
						packageType,
						{
							bin: {
								name: "bin",
								value: {
									type: packageType,
									value: { "not-so-awesome-bin": "./build/index.js" },
								},
							},
						},
					),
				).toThrowError(
					'Package field "bin" exhibits an incompatible output directory',
				);
			});
		});

		describe("when both exports & package fields match our assumptions", () => {
			it('derives the normalized output directory for a "module" field + "." export', () => {
				expect(
					deriveOutputConfig(
						{
							".": {
								default: "./dist/index.js",
							},
						},
						packageType,
						{
							module: {
								name: "module",
								value: {
									type: "module",
									value: {
										".": "./dist/index.js",
									},
								},
							},
						},
					),
				).toStrictEqual({
					module: true,
					outDir: "dist",
					...(packageType === "commonjs" && { commonjs: true }),
				});
			});

			it('derives the normalized output directory for "module" + "bin" fields + some exports', () => {
				expect(
					deriveOutputConfig(
						{
							".": {
								default: "./dist/index.js",
							},
						},
						packageType,
						{
							module: {
								name: "module",
								value: {
									type: "module",
									value: {
										".": "./dist/index.js",
									},
								},
							},
							bin: {
								name: "bin",
								value: {
									type: packageType,
									value: {
										"awesome-bin": "./dist/index.js",
									},
								},
							},
						},
					),
				).toStrictEqual({
					module: true,
					outDir: "dist",
					...(packageType === "commonjs" && { commonjs: true }),
				});
			});

			it('derives the deep normalized output directory for "module" + "bin" fields + some exports', () => {
				expect(
					deriveOutputConfig(
						{
							".": {
								module: "./dist/lib/foo/bar.js",
							},
							"./foo": {
								default: "./dist/lib/foo.js",
								require: null,
							},
							"./foo/bar": {
								default: "./dist/lib/index.js",
							},
							"./bar": {
								import: "./dist/lib/bar/index.js",
								default: null,
							},
						},
						packageType,
						{
							module: {
								name: "module",
								value: {
									type: "module",
									value: {
										".": "./dist/lib/index.js",
									},
								},
							},
							bin: {
								name: "bin",
								value: {
									type: packageType,
									value: {
										"awesome-bin": "./dist/lib/bin.js",
									},
								},
							},
						},
					),
				).toStrictEqual({
					module: true,
					outDir: "dist/lib",
					...(packageType === "commonjs" && { commonjs: true }),
				});
			});
		});
	});
});
