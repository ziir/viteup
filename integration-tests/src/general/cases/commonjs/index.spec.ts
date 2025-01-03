import path from "node:path";
import { describe, expect, it } from "vitest";
import { build } from "viteup/api";

describe("commonjs", () => {
  it("builds a CommonJS package with a package.json['main'] field", async () => {
    const results = await build(
      { build: { write: false } },
      path.join(import.meta.dirname, "package")
    );    
    expect(results[0].output[0].code).toMatchInlineSnapshot(`
      "'use strict';

      Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

      const foo = "bar";

      exports.foo = foo;
      //# sourceMappingURL=index.js.map
      "
    `);
  });
});
