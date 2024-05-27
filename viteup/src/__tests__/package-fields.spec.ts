import { describe, expect, it } from "vitest";

import { getFromPackageFields } from "../package-fields";

describe("getFromPackageFields", () => {
	it("retrieves an entry from the package.json['bin'] field", () => {
		expect(
			getFromPackageFields({
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
					viteup: "./dist/viteup.js",
				},
			},
		});
	});

	it("retrieves an entry from the package.json['module'] field", () => {
		expect(
			getFromPackageFields({
				name: "dummy",
				version: "0.0.1",
				module: "./dist/index.js",
			}),
		).toStrictEqual({
			module: {
				name: "module",
				value: {
					".": "./dist/index.js",
				},
			},
		});
	});

	it("retrieves an entry from the package.json['bin'] field", () => {
		expect(
			getFromPackageFields({
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
					viteup: "./dist/viteup.js",
				},
			},
		});
	});

	it("retrieves all entries from the respective package.json fields", () => {
		expect(
			getFromPackageFields({
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
					".": "./dist/index.js",
				},
			},
			bin: {
				name: "bin",
				value: {
					viteup: "./dist/viteup.js",
				},
			},
		});
	});

	it("ignores other fields such as package.json['main'] & package.json['browser']", () => {
		expect(
			getFromPackageFields({
				name: "dummy",
				version: "0.0.1",
				main: "./dist/index.js",
				browser: "./dist/browser.js",
			}),
		).toStrictEqual({});
	});

	it("throws for an empty package.json['bin'] field value", () => {
		expect(() =>
			getFromPackageFields({
				name: "dummy",
				version: "0.0.1",
				bin: "",
			}),
		).toThrowErrorMatchingInlineSnapshot(
			`[Error: package.json['bin'] is invalid]`,
		);
	});

	it("throws for an empty package.json['bin'] field value", () => {
		expect(() =>
			getFromPackageFields({
				name: "dummy",
				version: "0.0.1",
				bin: {
					dummy: "",
				},
			}),
		).toThrowErrorMatchingInlineSnapshot(
			`[Error: package.json['bin'] is invalid]`,
		);
	});

	it("throws for a non-string package.json['module'] field value", () => {
		expect(() =>
			getFromPackageFields({
				name: "dummy",
				version: "0.0.1",
				// @ts-expect-error
				module: {
					index: "./dist/viteup.js",
				},
			}),
		).toThrowErrorMatchingInlineSnapshot(
			`[Error: package.json['module'] must be a string path]`,
		);
	});
});
