import path from "node:path";
import { describe, expect, it } from "vitest";
import { build } from "viteup/api";

describe("swc", () => {
  describe("tests", () => {
    it("builds an ESM package containing exports with a Vite config override & custom SWC options", async () => {
      const results = await build(
        { build: { write: false } },
        path.join(import.meta.dirname, "package")
      );

      expect(results[0].output[0].code).toMatchInlineSnapshot(`
				"function _ts_decorate(decorators, target, key, desc) {
				    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
				    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
				    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
				    return c > 3 && r && Object.defineProperty(target, key, r), r;
				}
				function _ts_metadata(k, v) {
				    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
				}
				function sealed(ctor) {
				    Object.seal(ctor);
				    Object.seal(ctor.prototype);
				}
				class BugReport {
				    constructor(t){
				        this.type = "report";
				        this.title = t;
				    }
				}
				BugReport = _ts_decorate([
				    sealed,
				    _ts_metadata("design:type", Function),
				    _ts_metadata("design:paramtypes", [
				        String
				    ])
				], BugReport);

				export { BugReport };
				//# sourceMappingURL=index.js.map
				"
			`);
    });
  });
});
