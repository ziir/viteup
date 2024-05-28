import path from "node:path";
import { describe, expect, it } from "vitest";
import { build } from "viteup/pure";

describe("cjs-bin-string", () => {
	it("builds a CommonJS package with a package.json['bin'] string field", async () => {
		const results = await build(path.join(import.meta.dirname, "package"));
		expect(results[0].output[0].code).toMatchInlineSnapshot(`
			"'use strict';

			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

			const foo = 'bar';

			exports.foo = foo;
			//# sourceMappingURL=index.js.map
			"
		`);
	});
});
