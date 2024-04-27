import path = require("node:path");
import {
	type InlineConfig,
	type UserConfig,
	loadConfigFromFile,
	mergeConfig,
} from "vite";
import swc from "vite-plugin-swc-transform";

function matchAllExternalModules(id: string) {
	!id.startsWith(".") && !path.isAbsolute(id);
}

export function getBaseConfig(
	entrypoints: Record<string, string>,
	packagePath = ".",
): UserConfig {
	return {
		root: packagePath,
		build: {
			outDir: "dist/esm",
			target: "esnext",
			sourcemap: true,
			minify: false,
			reportCompressedSize: false,
			lib: {
				entry: entrypoints,
				formats: ["es"],
			},
			rollupOptions: {
				external: matchAllExternalModules,
				output: {
					preserveModules: true,
				},
			},
		},
		plugins: [
			swc({
				swcOptions: {
					jsc: {
						target: "es2021",
					},
				},
			}),
		],
	};
}

export async function getViteConfig(
	entrypoints: Record<string, string>,
	packagePath = ".",
) {
	const baseConfig = getBaseConfig(entrypoints, packagePath);
	const loadOverrideConfigResult = await loadConfigFromFile(
		{
			command: "build",
			mode: "production",
		},
		undefined,
		packagePath,
	);

	if (!loadOverrideConfigResult) {
		return baseConfig;
	}

	const { config: overrideConfig } = loadOverrideConfigResult;
	if (Array.isArray(overrideConfig.plugins)) {
		const redudantPlugin = await overrideConfig.plugins.reduce(
			async (acc, currP) => {
				await acc;
				const curr = await currP;
				if (curr && !Array.isArray(curr)) {
					if (curr.name === "swc-transform" && curr.enforce === "pre") {
						return currP;
					}
				}
				return acc;
			},
			Promise.resolve(null),
		);

		if (redudantPlugin) {
			overrideConfig.plugins = overrideConfig.plugins.filter(
				(plugin) => plugin !== redudantPlugin,
			);
		}
	}

	return mergeConfig(baseConfig as InlineConfig, overrideConfig);
}
