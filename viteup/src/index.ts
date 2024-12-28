import { mergeConfig, build as viteBuild, type InlineConfig } from "vite";

import { getPackageFieldEntries } from "./package-field-entries.ts";
import { readPackageJson } from "./package.ts";
import { getViteConfig } from "./vite-config.ts";
import { deriveOutputConfig } from "./derive-output-config.ts";
import { deriveEntrypoints } from "./derive-entrypoints.ts";
import { getPackageType } from "./package-type.ts";

export const pkg = readPackageJson();
export const pkgType = getPackageType(pkg);
export const packageFieldEntries = getPackageFieldEntries(pkgType, pkg);

export const outputConfig = deriveOutputConfig(
  pkg.exports,
  pkgType,
  packageFieldEntries,
);

export const entrypoints = deriveEntrypoints(
  outputConfig,
  pkg.exports,
  packageFieldEntries,
);

export async function build(inlineViteConfig: InlineConfig = {}) {
  return viteBuild(
    mergeConfig(
      await getViteConfig(outputConfig, entrypoints),
      mergeConfig({ configFile: false, envFile: false }, inlineViteConfig),
    ),
  );
}
