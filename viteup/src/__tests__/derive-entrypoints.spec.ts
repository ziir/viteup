import { vi, describe, expect, it } from "vitest";
import { deriveEntrypoints } from "../derive-entrypoints.ts";
import type { PackageFieldEntries } from "../types.ts";

vi.mock("../match-source-files.ts", () => {
  return {
    checkSourceFileExists: vi.fn(() => true),
    matchSourceFile: vi.fn((path: string) => `src/${path}.ts`),
  };
});

describe("deriveEntrypoints", () => {
  describe("when provided a single string export", () => {
    it("derives exports", () => {
      expect(
        deriveEntrypoints(
          {
            module: true,
            outDir: "dist",
          },
          "./dist/index.js",
        ),
      ).toStrictEqual({
        "src/index.ts": "index",
      });
    });
  });

  describe("when provided a single export with a simple supported condition", () => {
    it("derives exports", () => {
      expect(
        deriveEntrypoints(
          {
            module: true,
            outDir: "dist",
          },
          {
            ".": {
              default: "./dist/index.js",
            },
          },
        ),
      ).toStrictEqual({
        "src/index.ts": "index",
      });
    });
  });

  describe("when provided a single export with a nested supported condition", () => {
    it("derives exports", () => {
      expect(
        deriveEntrypoints(
          {
            module: true,
            outDir: "dist",
          },
          {
            ".": {
              import: {
                default: "./dist/index.js",
              },
            },
          },
        ),
      ).toStrictEqual({
        "src/index.ts": "index",
      });
    });
  });

  describe("when provided a single export with default + require conditions", () => {
    it("derives exports", () => {
      expect(
        deriveEntrypoints(
          {
            module: true,
            commonjs: true,
            outDir: "dist",
          },
          {
            ".": {
              require: "./dist/foo.cjs",
              default: "./dist/index.js",
            },
          },
        ),
      ).toStrictEqual({
        "src/index.ts": "index",
        "src/foo.ts": "foo",
      });
    });
  });

  describe("when provided a single export with a supported condition & unsupported conditions", () => {
    it("derives exports", () => {
      expect(
        deriveEntrypoints(
          {
            module: true,
            commonjs: true,
            outDir: "dist",
          },
          {
            ".": {
              type: "./dist/index.d.ts",
              require: "./dist/index.cjs",
              default: "./dist/index.js",
            },
          },
        ),
      ).toStrictEqual({
        "src/index.ts": "index",
      });
    });
  });

  describe("when provided mutliple exports with a common source file name", () => {
    it("derives exports", () => {
      expect(
        deriveEntrypoints(
          {
            module: true,
            outDir: "dist",
          },
          {
            ".": {
              default: "./dist/index.js",
            },
            "./foo": {
              default: "./dist/foo/index.js",
            },
          },
        ),
      ).toStrictEqual({
        "src/index.ts": "index",
        "src/foo/index.ts": "foo/index",
      });
    });
  });

  describe("when provided multiple out-of-order exports with a common source file name", () => {
    it("derives exports", () => {
      expect(
        deriveEntrypoints(
          {
            module: true,
            outDir: "dist",
          },
          {
            "./foo": {
              default: "./dist/foo/index.js",
            },
            ".": {
              default: "./dist/index.js",
            },
          },
        ),
      ).toStrictEqual({
        "src/index.ts": "index",
        "src/foo/index.ts": "foo/index",
      });
    });
  });

  describe("when provided multiple exports + module with a common source file name", () => {
    it("derives exports", () => {
      expect(
        deriveEntrypoints(
          {
            module: true,
            outDir: "dist",
          },
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
              value: {
                ".": {
                  type: "module",
                  value: "./dist/index.js",
                },
              },
            },
          },
        ),
      ).toStrictEqual({
        "src/index.ts": "index",
        "src/foo/index.ts": "foo/index",
        "src/bar/foo/index.ts": "bar/foo/index",
        "src/bar/foo/bar/index.ts": "bar/foo/bar/index",
        "src/foo/bar/foo/index.ts": "foo/bar/foo/index",
      });
    });
  });

  describe("when provided multiple out-of-order exports + module with a common source file name", () => {
    it("derives exports", () => {
      expect(
        deriveEntrypoints(
          {
            module: true,
            outDir: "dist",
          },
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
              value: {
                ".": {
                  type: "module",
                  value: "./dist/index.js",
                },
              },
            },
          },
        ),
      ).toStrictEqual({
        "src/index.ts": "index",
        "src/foo/index.ts": "foo/index",
        "src/bar/foo/index.ts": "bar/foo/index",
        "src/bar/foo/bar/index.ts": "bar/foo/bar/index",
        "src/foo/bar/foo/index.ts": "foo/bar/foo/index",
      });
    });
  });

  describe("when provided a standard package.json with multiple exports w/ types + default conditions", () => {
    it("derives flat exports", () => {
      expect(
        deriveEntrypoints(
          {
            module: true,
            outDir: "dist",
          },
          {
            "./package.json": "./package.json",
            ".": {
              types: "./dist/index.d.ts",
              default: "./dist/index.js",
            },
            "./foo": {
              types: "./dist/foo.d.ts",
              default: "./dist/foo.js",
            },
          },
        ),
      ).toStrictEqual({
        "src/index.ts": "index",
        "src/foo.ts": "foo",
      });
    });

    it("derives deep exports", () => {
      expect(
        deriveEntrypoints(
          {
            module: true,
            outDir: "dist/esm",
          },
          {
            "./package.json": "./package.json",
            ".": {
              types: "./dist/types/index.d.ts",
              default: "./dist/esm/index.js",
            },
            "./foo": {
              types: "./dist/types/foo.d.ts",
              default: "./dist/esm/foo.js",
            },
          },
        ),
      ).toStrictEqual({
        "src/index.ts": "index",
        "src/foo.ts": "foo",
      });
    });

    it("ignores non-supported conditions", () => {
      expect(
        deriveEntrypoints(
          {
            module: true,
            outDir: "dist/esm",
          },
          {
            "./package.json": "./package.json",
            ".": {
              types: "./dist/types/index.d.ts",
              default: "./dist/esm/index.js",
            },
            "./foo": {
              types: "./dist/types/foo.d.ts",
              default: "./dist/esm/foo.js",
            },
          },
        ),
      ).toStrictEqual({
        "src/index.ts": "index",
        "src/foo.ts": "foo",
      });
    });

    it("derives commonjs entrypoint", () => {
      expect(
        deriveEntrypoints(
          {
            commonjs: true,
            outDir: "dist/lib",
          },
          {
            "./package.json": "./package.json",
            ".": {
              types: "./dist/types/index.d.ts",
              require: "./dist/lib/index.cjs",
            },
          },
        ),
      ).toStrictEqual({
        "src/index.ts": "index",
      });
    });

    it("throws for no exports, nor 'bin' or 'module' entries", () => {
      expect(() =>
        deriveEntrypoints(
          {
            module: true,
            outDir: "impossible",
          },
          {},
          {} as PackageFieldEntries,
        ),
      ).toThrowError("Unable to determine entry points");
    });

    it("acknowledges 'bin' & 'module' entries", () => {
      expect(
        deriveEntrypoints(
          {
            module: true,
            outDir: "dist",
          },
          {},
          {
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
                type: "module",
                value: {
                  "awesome-bin": "./dist/awesome-bin.js",
                },
              },
            },
          },
        ),
      ).toStrictEqual({
        "src/awesome-bin.ts": "awesome-bin",
        "src/index.ts": "index",
      });
    });

    it("dedupes 'module' entry with '.' export", () => {
      expect(
        deriveEntrypoints(
          {
            module: true,
            outDir: "dist",
          },
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
                ".": {
                  type: "module",
                  value: "./dist/index.js",
                },
              },
            },
          },
        ),
      ).toStrictEqual({
        "src/index.ts": "index",
      });
    });

    it("treats 'module' entry & '.' export as separate entrypoints", () => {
      expect(
        deriveEntrypoints(
          {
            module: true,
            outDir: "dist",
          },
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
                ".": {
                  type: "module",
                  value: "./dist/module.js",
                },
              },
            },
          },
        ),
      ).toStrictEqual({
        "src/index.ts": "index",
        "src/module.ts": "module",
      });
    });

    it("throws for a super invalid import / module (ESM) supported export condition", () => {
      expect(() =>
        deriveEntrypoints(
          {
            module: true,
            outDir: "impossible",
          },
          // @ts-expect-error
          {
            ".": {
              import: 1,
              module: 2,
              default: 3,
            },
          },
        ),
      ).toThrowError(
        'Package export "." does not include a valid "import" conditional value',
      );
    });

    it("treats default / import / module (ESM) export conditions individually", () => {
      expect(
        deriveEntrypoints(
          {
            module: true,
            outDir: "dist",
          },
          {
            ".": {
              module: "./dist/module.js",
              import: "./dist/import.js",
              default: "./dist/default.js",
            },
          },
        ),
      ).toStrictEqual({
        "src/module.ts": "module",
        "src/import.ts": "import",
        "src/default.ts": "default",
      });
    });

    it("handles other conditions & null conditional values, incl. short-hands", () => {
      expect(
        deriveEntrypoints(
          {
            module: true,
            outDir: "dist",
          },
          {
            ".": "./dist/default.js",
            "./testing": {
              production: null,
              default: "./dist/testing.js",
            },
          },
        ),
      ).toStrictEqual({
        "src/default.ts": "default",
        "src/testing.ts": "testing",
      });
    });

    it("throws for a super invalid export", () => {
      expect(() =>
        deriveEntrypoints(
          {
            module: true,
            outDir: "dist",
          },
          {
            ".": null,
          },
        ),
      ).toThrowError(
        'Package export "." does not include a valid conditional value',
      );
    });
  });

  describe("when provided a standard package.json with multiple type of exports: one export w/ types + default conditions, the package json export, one css export and one folder exports", () => {
    it("derives exports", () => {
      expect(
        deriveEntrypoints(
          {
            module: true,
            outDir: "dist",
          },
          {
            "./package.json": "./package.json",
            ".": {
              types: "./dist/index.d.ts",
              source: "./src/index.ts",
              default: "./dist/index.mjs",
            },
            "./goo": {
              types: "./dist/goo/index.d.ts",
              source: "./src/goo/index.ts",
              default: "./dist/goo/index.mjs",
            },
            "./foo/styles.css": "./dist/foo/styles.css",
            "./ioo/": "./dist/ioo/",
            "./hoo/": "./dist/hoo/",
          }
        )
      ).toStrictEqual({
        "src/index.ts": "index",
        "src/goo/index.ts": "goo/index"
      });
    });
  });
});
