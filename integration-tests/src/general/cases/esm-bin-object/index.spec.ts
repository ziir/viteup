import path from "node:path";
import { describe, expect, it } from "vitest";
import { build } from "viteup/pure";

describe("esm-bin-string", () => {
	it("builds an ESM package with a package.json['bin'] object field", async () => {
		const results = await build(path.join(import.meta.dirname, "package"));
		expect(results[0].output[0].code).toMatchInlineSnapshot(`
			"const foo = 'bar';

			export { foo };
			//# sourceMappingURL=awesome-bin.js.map
			"
		`);
	});
});
