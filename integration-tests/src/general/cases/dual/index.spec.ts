import path from "node:path";
import { describe, expect, it } from "vitest";
import { build } from "viteup/pure";

describe("dual", () => {
	it("builds a dual CJS / ESM package", async () => {
		const results = await build(path.join(import.meta.dirname, "package"));
		expect(results[0].output[0].code).toMatchInlineSnapshot(`
			"'use strict';

			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

			const foo = 'bar';

			exports.foo = foo;
			//# sourceMappingURL=index.js.map
			"
		`);
		expect(results[0].output[1]).toMatchInlineSnapshot(`
			{
			  "fileName": "index.js.map",
			  "name": undefined,
			  "needsCodeReference": false,
			  "source": "{"version":3,"file":"index.js","sources":["../src/index.ts"],"sourcesContent":["export const foo = 'bar';"],"names":["foo"],"mappings":";;;;AAAO,MAAMA,MAAM;;;;"}",
			  "type": "asset",
			}
		`);
		expect(results[0].output.length).toBe(2);

		expect(results[1].output[0].code).toMatchInlineSnapshot(`
			"const foo = 'bar';

			export { foo };
			//# sourceMappingURL=index.mjs.map
			"
		`);
		expect(results[1].output[1]).toMatchInlineSnapshot(`
			{
			  "fileName": "index.mjs.map",
			  "name": undefined,
			  "needsCodeReference": false,
			  "source": "{"version":3,"file":"index.mjs","sources":["../src/index.ts"],"sourcesContent":["export const foo = 'bar';"],"names":["foo"],"mappings":"AAAO,MAAMA,MAAM;;;;"}",
			  "type": "asset",
			}
		`);
		expect(results[1].output.length).toBe(2);
		expect(results.length).toBe(2);
	});
});
