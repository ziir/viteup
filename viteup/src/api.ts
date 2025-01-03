import { mergeConfig, build as viteBuild, type InlineConfig } from "vite";

import { getPackageFieldEntries } from "./package-field-entries.ts";
import { readPackageJson } from "./package-pure.ts";
import {
  getDefaultSwcTransformPluginOptions,
  getBaseViteConfig,
  getViteConfig,
  matchAllExternalModules,
} from "./vite-config.ts";
import { deriveOutputConfig } from "./derive-output-config.ts";
import { deriveEntrypoints } from "./derive-entrypoints.ts";
import { getPackageType } from "./package-type.ts";

export { getPackageFieldEntries };
export { readPackageJson };
export {
  getDefaultSwcTransformPluginOptions,
  getBaseViteConfig,
  getViteConfig,
  matchAllExternalModules,
};

export async function getResolvedViteConfig(pathToPackage = ".") {
  try {
    const pkg = readPackageJson(pathToPackage);
    const pkgType = getPackageType(pkg);

    const packageFieldEntries = getPackageFieldEntries(pkgType, pkg);

    const outputConfig = deriveOutputConfig(
      pkg.exports,
      pkgType,
      packageFieldEntries,
    );

    const entrypoints = deriveEntrypoints(
      outputConfig,
      pkg.exports,
      packageFieldEntries,
      pathToPackage,
    );

    return await getViteConfig(outputConfig, entrypoints, pathToPackage);
  } catch (err) {
    console.error("Failed to resolve vite config:", err);
    throw err;
  }
}

export async function build(
  inlineViteConfig: InlineConfig = {},
  pathToPackage = ".",
) {
  return viteBuild(
    mergeConfig(
      await getResolvedViteConfig(pathToPackage),
      mergeConfig({ configFile: false, envFile: false }, inlineViteConfig),
    ),
  );
}
