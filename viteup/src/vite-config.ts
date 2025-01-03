import path from "node:path";
import {
  type InlineConfig,
  type PluginOption,
  type UserConfig,
  loadConfigFromFile,
  mergeConfig,
} from "vite";
import type { DerivedOutputConfig } from "./types.ts";

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

export async function getBaseViteConfig(
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
    clearScreen: false,
    server: undefined,
    ssr: undefined,
    environments: {},
    appType: "custom",
    publicDir: false,
    mode: "production",
    resolve: {
      extensions: [".ts", ".tsx"],
    },
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

export async function getViteConfig(
  outputConfig: DerivedOutputConfig,
  entrypoints: Record<string, string>,
  packagePath = ".",
) {
  const [baseConfig, overrideConfigResult] = await Promise.all([
    getBaseViteConfig(outputConfig, entrypoints, packagePath),
    loadConfigFromFile(
      {
        command: "build",
        mode: "production",
        isSsrBuild: false,
        isPreview: false,
      },
      undefined,
      packagePath,
    ),
  ]);

  if (!overrideConfigResult) {
    return baseConfig;
  }

  const { config: overrideConfig } = overrideConfigResult;

  let removeBaseConfigCompilerPlugin = !!overrideConfig.esbuild;

  if (Array.isArray(overrideConfig.plugins)) {
    removeBaseConfigCompilerPlugin =
      removeBaseConfigCompilerPlugin || overrideConfig.plugins.length === 0;

    if (!removeBaseConfigCompilerPlugin) {
      removeBaseConfigCompilerPlugin = await hasCompilerPluginOverride(
        overrideConfig.plugins,
      );
    }
  }

  if (removeBaseConfigCompilerPlugin) {
    // biome-ignore lint/style/noNonNullAssertion: we always define plugins in the base config, at least the compiler plugin
    baseConfig.plugins!.shift();
  }

  return mergeConfig(baseConfig as InlineConfig, overrideConfig);
}
