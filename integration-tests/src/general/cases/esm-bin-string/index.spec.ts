import path from "node:path";
import { describe, expect, it } from "vitest";
import { build } from "viteup/api";

describe("esm-bin-string", () => {
  it("builds an ESM package with a package.json['bin'] string field", async () => {
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
  });
});
