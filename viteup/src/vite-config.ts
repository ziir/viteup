import path from "node:path";
import {
	type InlineConfig,
	type PluginOption,
	type UserConfig,
	loadConfigFromFile,
	mergeConfig,
} from "vite";
import type { DerivedOutputConfig } from "./types";

export function matchAllExternalModules(id: string) {
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

export async function getBaseConfig(
	outputConfig: DerivedOutputConfig,
	entrypoints: Record<string, string>,
	packagePath = ".",
): Promise<UserConfig> {
	let swc = null;
	try {
		swc = await import("vite-plugin-swc-transform");
	} catch (err) {}

	const outputFormats: Array<"cjs" | "es"> = [];
	if ("commonjs" in outputConfig) outputFormats.push("cjs");
	if ("module" in outputConfig) outputFormats.push("es");

	return {
		root: packagePath,
		build: {
			outDir: outputConfig.outDir,
			sourcemap: true,
			minify: false,
			reportCompressedSize: false,
			lib: {
				entry: Object.fromEntries(
					Object.entries(entrypoints).map(([k, v]) => [v, k]),
				),
				formats: outputFormats,
			},
			rollupOptions: {
				external: matchAllExternalModules,
				output: {
					preserveModules: true,
				},
			},
		},
		plugins: swc ? [swc.default(getDefaultSwcTransformPluginOptions())] : [],
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

export async function getViteConfig(baseConfig: UserConfig, packagePath = ".") {
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

		if (compilerPluginOverride || overrideConfig.plugins.length === 0) {
			// biome-ignore lint/style/noNonNullAssertion: we always define plugins in the base config, at least the compiler plugin
			baseConfig.plugins!.shift();
		}
	}

	return mergeConfig(baseConfig as InlineConfig, overrideConfig);
}
