import { describe, expect, it, test } from "vitest";

import {
	getBaseConfig,
	getDefaultSwcTransformPluginOptions,
	matchAllExternalModules,
} from "../vite-config";

describe("matchAllExternalModules", () => {
	test.each([
		{ id: ".", expected: false },
		{ id: "./", expected: false },
		{ id: "./index", expected: false },
		{ id: "./foo/bar/baz", expected: false },
		{ id: "../foo/bar/baz", expected: false },
		{ id: "../../foo/bar/baz", expected: false },
		{ id: "/foo/bar/az", expected: false },
		{ id: "@foo/bar", expected: true },
		{ id: "@foo/bar/baz", expected: true },
		{ id: "#package.json", expected: true },
		// FIXME: should be false if resolves to a local module.
		{ id: "#package.json", expected: true },
	])("matchAllExternalModules($id) -> $expected", ({ id, expected }) => {
		expect(matchAllExternalModules(id)).toBe(expected);
	});
});

describe("getDefaultSwcTransformPluginOptions", () => {
	it("matches inline snapshot", () => {
		expect(getDefaultSwcTransformPluginOptions()).toMatchInlineSnapshot(
			{
				swcOptions: {
					jsc: {
						target: "es2021",
					},
				},
			},
			`
			{
			  "swcOptions": {
			    "jsc": {
			      "target": "es2021",
			    },
			  },
			}
		`,
		);
	});
});

describe("getBaseConfig", () => {
	it("matches inline snapshot: without a package path", async () => {
		expect(
			await getBaseConfig(
				{ outDir: "./dist/esm", module: true },
				{
					"./src/index.js": "index",
				},
			),
		).toMatchInlineSnapshot(`
			{
			  "build": {
			    "lib": {
			      "entry": {
			        "index": "./src/index.js",
			      },
			      "formats": [
			        "es",
			      ],
			    },
			    "minify": false,
			    "outDir": "./dist/esm",
			    "reportCompressedSize": false,
			    "rollupOptions": {
			      "external": [Function],
			      "output": {
			        "preserveModules": true,
			      },
			    },
			    "sourcemap": true,
			  },
			  "plugins": [
			    {
			      "config": [Function],
			      "configResolved": [Function],
			      "enforce": "pre",
			      "name": "swc-transform",
			      "transform": [Function],
			    },
			  ],
			  "root": ".",
			}
		`);
	});

	it("matches inline snapshot: ESM + CJS", async () => {
		expect(
			await getBaseConfig(
				{ outDir: "./dist/esm", module: true, commonjs: true },
				{
					"./src/index.js": "index",
				},
			),
		).toMatchInlineSnapshot(`
			{
			  "build": {
			    "lib": {
			      "entry": {
			        "index": "./src/index.js",
			      },
			      "formats": [
			        "cjs",
			        "es",
			      ],
			    },
			    "minify": false,
			    "outDir": "./dist/esm",
			    "reportCompressedSize": false,
			    "rollupOptions": {
			      "external": [Function],
			      "output": {
			        "preserveModules": true,
			      },
			    },
			    "sourcemap": true,
			  },
			  "plugins": [
			    {
			      "config": [Function],
			      "configResolved": [Function],
			      "enforce": "pre",
			      "name": "swc-transform",
			      "transform": [Function],
			    },
			  ],
			  "root": ".",
			}
		`);
	});

	it("matches inline snapshot: with a package path", async () => {
		expect(
			await getBaseConfig(
				{ outDir: "./dist/esm", module: true },
				{
					"./src/index.js": "index",
				},
			),
			"./path/to/package",
		).toMatchInlineSnapshot(`
			{
			  "build": {
			    "lib": {
			      "entry": {
			        "index": "./src/index.js",
			      },
			      "formats": [
			        "es",
			      ],
			    },
			    "minify": false,
			    "outDir": "./dist/esm",
			    "reportCompressedSize": false,
			    "rollupOptions": {
			      "external": [Function],
			      "output": {
			        "preserveModules": true,
			      },
			    },
			    "sourcemap": true,
			  },
			  "plugins": [
			    {
			      "config": [Function],
			      "configResolved": [Function],
			      "enforce": "pre",
			      "name": "swc-transform",
			      "transform": [Function],
			    },
			  ],
			  "root": ".",
			}
		`);
	});
});
