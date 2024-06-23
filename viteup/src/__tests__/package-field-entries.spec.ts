import { describe, expect, it } from "vitest";

import { getPackageFieldEntries } from "../package-field-entries";

describe("getFromPackageFields", () => {
	describe.each([
		{ packageType: "commonjs" },
		{ packageType: "module" },
	] as const)(
		"for a given package of inferred or explicit type $packageType",
		({ packageType }) => {
			it("retrieves an entry from the package.json['bin'] field", () => {
				expect(
					getPackageFieldEntries(packageType, {
						name: "dummy",
						version: "0.0.1",
						bin: {
							viteup: "./dist/viteup.js",
						},
					}),
				).toStrictEqual({
					bin: {
						name: "bin",
						value: {
							type: packageType,
							value: {
								viteup: "./dist/viteup.js",
							},
						},
					},
				});
			});

			it("retrieves an entry from the package.json['module'] field", () => {
				expect(
					getPackageFieldEntries(packageType, {
						name: "dummy",
						version: "0.0.1",
						module: "./dist/index.js",
					}),
				).toStrictEqual({
					module: {
						name: "module",
						value: {
							".": {
								type: "module",
								value: "./dist/index.js",
							},
						},
					},
				});
			});

			it("retrieves an entry from the package.json['bin'] field", () => {
				expect(
					getPackageFieldEntries(packageType, {
						name: "dummy",
						version: "0.0.1",
						bin: {
							viteup: "./dist/viteup.js",
						},
					}),
				).toStrictEqual({
					bin: {
						name: "bin",
						value: {
							type: packageType,
							value: {
								viteup: "./dist/viteup.js",
							},
						},
					},
				});
			});

			it("retrieves all entries from the respective package.json fields", () => {
				expect(
					getPackageFieldEntries(packageType, {
						name: "dummy",
						version: "0.0.1",
						module: "./dist/index.js",
						bin: {
							viteup: "./dist/viteup.js",
						},
					}),
				).toStrictEqual({
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
							value: {
								viteup: "./dist/viteup.js",
							},
						},
					},
				});
			});

			it("ignores other fields such as package.json['browser']", () => {
				expect(
					getPackageFieldEntries(packageType, {
						name: "dummy",
						version: "0.0.1",
						main: "./dist/index.js",
						browser: "./dist/browser.js",
					}),
				).toStrictEqual({
					main: {
						name: "main",
						value: {
							".": {
								type: packageType,
								value: "./dist/index.js",
							},
						},
					},
				});
			});

			it("throws for an empty package.json['bin'] field value", () => {
				expect(() =>
					getPackageFieldEntries(packageType, {
						name: "dummy",
						version: "0.0.1",
						bin: "",
					}),
				).toThrowError("package.json['bin'] cannot be empty");
			});

			it("throws for an empty package.json['bin'] field inner value", () => {
				expect(() =>
					getPackageFieldEntries(packageType, {
						name: "dummy",
						version: "0.0.1",
						bin: {
							dummy: "",
						},
					}),
				).toThrowError("package.json['bin'] is invalid");
			});

			it("throws for a non-string package.json['module'] field value", () => {
				expect(() =>
					getPackageFieldEntries(packageType, {
						name: "dummy",
						version: "0.0.1",
						// @ts-expect-error
						module: {
							index: "./dist/viteup.js",
						},
					}),
				).toThrowError("package.json['module'] must be a string path");
			});
		},
	);
});
