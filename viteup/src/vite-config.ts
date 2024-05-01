import path from "node:path";
import {
	type InlineConfig,
	type PluginOption,
	type UserConfig,
	loadConfigFromFile,
	mergeConfig,
} from "vite";
import swc from "vite-plugin-swc-transform";

function matchAllExternalModules(id: string) {
	return !(id.startsWith(".") || path.isAbsolute(id));
}

export function getDefaultSwcTransformPluginOptions() {
	return {
		swcOptions: {
			jsc: {
				target: "es2021",
			},
		},
	} as const;
}

export function getBaseConfig(
	entrypoints: Record<string, string>,
	packagePath = ".",
): UserConfig {
	return {
		root: packagePath,
		build: {
			outDir: "dist",
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
		plugins: [swc(getDefaultSwcTransformPluginOptions())],
	};
}

export async function hasCompilerPluginOverride(
	pluginOptions: Array<PluginOption>,
): Promise<boolean> {
	let compilerPluginOverride = false;
	for (const pluginOption of pluginOptions) {
		if (compilerPluginOverride) break;
		const plugin = await pluginOption;
		if (plugin) {
			if (Array.isArray(plugin)) {
				compilerPluginOverride = await hasCompilerPluginOverride(pluginOptions);
			} else {
				compilerPluginOverride = plugin.enforce === "pre";
			}
		}
	}
	return compilerPluginOverride;
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
		const compilerPluginOverride = await hasCompilerPluginOverride(
			overrideConfig.plugins,
		);

		if (compilerPluginOverride) {
			// biome-ignore lint/style/noNonNullAssertion: we always define plugins in the base config, at least the compiler plugin
			baseConfig.plugins!.shift();
		}
	}

	return mergeConfig(baseConfig as InlineConfig, overrideConfig);
}
