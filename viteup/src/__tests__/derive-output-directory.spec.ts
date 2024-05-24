import { describe, expect, it } from "vitest";
import { deriveOutputDirectory } from "../derive-output-directory.js";
import type { PackageFieldEntries } from "../types.js";

describe("deriveOutputDirectory", () => {
	describe("when no exports / package field entries are provided", () => {
		it("throws", () => {
			expect(() =>
				deriveOutputDirectory({}, {} as PackageFieldEntries),
			).toThrowError(
				"Unable to determine output directory from package.json exports.",
			);
		});
	});

	describe("when no usable & supported exports / package field entries are provided", () => {
		it("throws for a require (CJS) export condition", () => {
			expect(() =>
				deriveOutputDirectory(
					{
						".": {
							require: "./dist/index.js",
						},
					},
					{} as PackageFieldEntries,
				),
			).toThrowError(
				"Unable to determine output directory from package.json exports.",
			);
		});

		it('throws for "null" default / import / module (ESM) supported export condition', () => {
			expect(() =>
				deriveOutputDirectory(
					{
						".": {
							import: null,
							module: null,
							default: null,
						},
					},
					{} as PackageFieldEntries,
				),
			).toThrowError(
				"Unable to determine output directory from package.json exports.",
			);
		});

		it("throws for invalid import / module (ESM) supported export condition", () => {
			expect(() =>
				deriveOutputDirectory(
					{
						".": {
							import: ["dist/index.js"],
							module: ["dist/index.js"],
							default: ["dist/index.js"],
						},
					},
					{} as PackageFieldEntries,
				),
			).toThrowError(
				"Unable to determine output directory from package.json exports.",
			);
		});

		it("throws for invalid import / module (ESM) supported export condition", () => {
			expect(() =>
				deriveOutputDirectory(
					{
						".": {
							import: {},
							module: {},
							default: {},
						},
					},
					{} as PackageFieldEntries,
				),
			).toThrowError(
				"Unable to determine output directory from package.json exports.",
			);
		});

		it("throws for a super invalid import / module (ESM) supported export condition", () => {
			expect(() =>
				deriveOutputDirectory(
					{
						// @ts-expect-error
						".": {
							import: 1,
							module: 2,
							default: 3,
						},
					},
					{} as PackageFieldEntries,
				),
			).toThrowError(
				'Package export "." does not include a valid "import" conditional value',
			);
		});

		it("throws for a super invalid export", () => {
			expect(() =>
				deriveOutputDirectory(
					{
						".": null,
					},
					{} as PackageFieldEntries,
				),
			).toThrowError(
				'Package export "." does not include a valid conditional value',
			);
		});

		it("throws for invalid import / module (ESM) supported export condition", () => {
			expect(() =>
				deriveOutputDirectory(
					{
						".": {
							import: "",
							module: "",
							default: "",
						},
					},
					{} as PackageFieldEntries,
				),
			).toThrowError(
				`Package export "." does not include a valid "import" conditional value`,
			);
		});
	});

	describe("when exports exhibit different, non-overlapping output directories", () => {
		it("throws", () => {
			expect(() =>
				deriveOutputDirectory(
					{
						".": {
							default: "./dist/index.js",
						},
						"./foo": {
							default: "./build/foo.js",
						},
					},
					{} as PackageFieldEntries,
				),
			).toThrowError(
				'Package export "./foo" exhibits a different, incompatible output directory than previously derived output directory ("dist")',
			);
		});
	});

	describe("when exports match our assumptions", () => {
		it('derives the normalized output directory for a trivial single "." export', () => {
			expect(
				deriveOutputDirectory(
					{
						".": {
							default: "./dist/index.js",
						},
					},
					{} as PackageFieldEntries,
				),
			).toBe("dist");
		});

		it('derives the normalized output directory for a deep single "." export', () => {
			expect(
				deriveOutputDirectory(
					{
						".": {
							default: "./dist/esm/index.js",
						},
					},
					{} as PackageFieldEntries,
				),
			).toBe("dist/esm");
		});

		it("derives the normalized output directory for multiple simple exports", () => {
			expect(
				deriveOutputDirectory(
					{
						".": {
							default: "./dist/index.js",
						},
						"./foo": {
							default: "./dist/foo.js",
						},
					},
					{} as PackageFieldEntries,
				),
			).toBe("dist");
		});

		it("derives the normalized output directory for multiple complex exports", () => {
			expect(
				deriveOutputDirectory(
					{
						".": {
							default: "./dist/esm/index.js",
						},
						"./foo": {
							import: "./dist/esm/foo/bar.js",
						},
						"./foo/bar": {
							module: "./dist/esm/foo/bar.js",
						},
						"./bar": {
							require: null,
							types: "./dist/types/bar.d.ts",
							default: "./dist/esm/bar.js",
						},
					},
					{} as PackageFieldEntries,
				),
			).toBe("dist/esm");
		});
	});

	describe("when package fields match our assumptions", () => {
		it('derives the normalized output directory for a "module" field', () => {
			expect(
				deriveOutputDirectory(
					{},
					{
						module: {
							name: "module",
							value: {
								".": "./dist/index.js",
							},
						},
					},
				),
			).toBe("dist");
		});

		it('ignores ".json" exports', () => {
			expect(
				deriveOutputDirectory(
					{
						"./package.json": "./package.json",
						".": {
							default: "./dist/index.js",
						},
					},
					{} as PackageFieldEntries,
				),
			).toBe("dist");
		});

		it('derives the normalized output directory for a "bin" field', () => {
			expect(
				deriveOutputDirectory(
					{},
					{
						bin: {
							name: "bin",
							value: {
								"awesome-bin": "./dist/bin.js",
							},
						},
					},
				),
			).toBe("dist");
		});

		it('derives the normalized output directory for "module" + "bin" field', () => {
			expect(
				deriveOutputDirectory(
					{},
					{
						module: {
							name: "module",
							value: {
								".": "./dist/index.js",
							},
						},
						bin: {
							name: "bin",
							value: {
								"awesome-bin": "./dist/bin.js",
							},
						},
					},
				),
			).toBe("dist");
		});

		it('derives the deep normalized output directory for "module" + "bin" field', () => {
			expect(
				deriveOutputDirectory(
					{},
					{
						module: {
							name: "module",
							value: {
								".": "./dist/esm/index.js",
							},
						},
						bin: {
							name: "bin",
							value: {
								"awesome-bin": "./dist/esm/bin/index.js",
							},
						},
					},
				),
			).toBe("dist/esm");
		});
	});

	describe("when package fields exhibit different, non-overlapping output directories", () => {
		it("throws", () => {
			expect(() =>
				deriveOutputDirectory(
					{},
					{
						module: {
							name: "module",
							value: {
								".": "./dist/index.js",
							},
						},
						bin: {
							name: "bin",
							value: {
								"not-so-awesome-bin": "./build/index.js",
							},
						},
					},
				),
			).toThrowError(
				'Package field "bin" exhibits a different, incompatible output directory than previously derived output directory ("dist")',
			);
		});
	});

	describe("when a package field exhibit different a different output directoriy than derived from exports", () => {
		it("throws", () => {
			expect(() =>
				deriveOutputDirectory(
					{
						".": {
							default: "./dist/index.js",
						},
					},
					{
						bin: {
							name: "bin",
							value: {
								"not-so-awesome-bin": "./build/index.js",
							},
						},
					},
				),
			).toThrowError(
				'Package field "bin" exhibits a different, incompatible output directory than previously derived output directory ("dist")',
			);
		});
	});

	describe("when both exports & package fields match our assumptions", () => {
		it('derives the normalized output directory for a "module" field + "." export', () => {
			expect(
				deriveOutputDirectory(
					{
						".": {
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
			).toBe("dist");
		});

		it('derives the normalized output directory for "module" + "bin" fields + some exports', () => {
			expect(
				deriveOutputDirectory(
					{
						".": {
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
						bin: {
							name: "bin",
							value: {
								"awesome-bin": "./dist/index.js",
							},
						},
					},
				),
			).toBe("dist");
		});

		it('derives the deep normalized output directory for "module" + "bin" fields + some exports', () => {
			expect(
				deriveOutputDirectory(
					{
						".": {
							module: "./dist/esm/foo/bar.js",
						},
						"./foo": {
							default: "./dist/esm/foo.js",
							require: null,
						},
						"./foo/bar": {
							default: "./dist/esm/index.js",
						},
						"./bar": {
							import: "./dist/esm/bar/index.js",
							default: null,
						},
					},
					{
						module: {
							name: "module",
							value: {
								".": "./dist/esm/index.js",
							},
						},
						bin: {
							name: "bin",
							value: {
								"awesome-bin": "./dist/esm/bin.js",
							},
						},
					},
				),
			).toBe("dist/esm");
		});
	});
});
