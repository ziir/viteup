import { defineProject, mergeConfig } from "vitest/config";
import { getResolvedViteConfig } from "./src/api.ts";

export default mergeConfig(
	getResolvedViteConfig(import.meta.dirname),
	defineProject({
		test: {
			include: ["./src/__tests__/*.spec.ts"],
		},
	}),
);
