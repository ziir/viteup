import { describe, expect, it } from "vitest";
import { getPackageType } from "../package-type";

describe("getPackageType", () => {
	it("defaults to commonjs", () => {
		expect(
			getPackageType({
				name: "dummy",
				version: "0.0.1",
			}),
		).toBe("commonjs");
	});

	it("respects type='commonjs'", () => {
		expect(
			getPackageType({
				name: "dummy",
				version: "0.0.1",
				type: "commonjs",
			}),
		).toBe("commonjs");
	});

	it("respects type='module'", () => {
		expect(
			getPackageType({
				name: "dummy",
				version: "0.0.1",
				type: "module",
			}),
		).toBe("module");
	});

	it("throws for an invalid type", () => {
		expect(() =>
			getPackageType({
				name: "dummy",
				version: "0.0.1",
				// @ts-expect-error
				type: "common-module",
			}),
		).toThrowErrorMatchingInlineSnapshot(
			`[Error: package.json['type'] must be type?: 'commonjs' | 'module']`,
		);
	});
});
