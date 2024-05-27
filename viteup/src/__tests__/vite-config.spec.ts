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
	it("matches inline snapshot: without a package path", () => {
		expect(
			getBaseConfig("./dist/esm", { index: "./src/index.js" }),
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
			    "target": "esnext",
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

	it("matches inline snapshot: with a package path", () => {
		expect(
			getBaseConfig("./dist/esm", { index: "./src/index.js" }),
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
			    "target": "esnext",
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
