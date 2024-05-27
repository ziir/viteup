import { defineProject, mergeConfig } from "vitest/config";
import { getResolvedViteConfig } from "./src/pure";

export default mergeConfig(
	getResolvedViteConfig(),
	defineProject({
		test: {
			include: ["./src/__tests__/*.spec.ts"],
		},
	}),
);
