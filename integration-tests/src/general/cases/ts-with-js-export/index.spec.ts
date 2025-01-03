import path from "node:path";
import { describe, expect, it } from "vitest";
import { build } from "viteup/api";

describe("ts-with-js-export", () => {
  it("builds an ESM package with an extra Node.js / CJS export", async () => {
    const results = await build(
      { build: { write: false } },
      path.join(import.meta.dirname, "package")
    );    

    expect(results[0].output[0].code).toMatchInlineSnapshot(`
      "const foo = "bar";

      export { foo };
      //# sourceMappingURL=index.js.map
      "
    `);
    expect(results[0].output[1]).toMatchInlineSnapshot(`
      {
        "fileName": "index.js.map",
        "name": undefined,
        "names": [],
        "needsCodeReference": false,
        "originalFileName": null,
        "originalFileNames": [],
        "source": "{"version":3,"file":"index.js","sources":["../src/index.ts"],"sourcesContent":["export const foo = \\"bar\\";\\n"],"names":["foo"],"mappings":"AAAO,MAAMA,MAAM;;;;"}",
        "type": "asset",
      }
    `);
    expect(results[0].output.length).toBe(2);
    expect(results.length).toBe(1);
  });
});
