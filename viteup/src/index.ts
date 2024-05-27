import { build as viteBuild } from "vite";

import { getExports } from "./exports.js";
import { matchSourceFiles } from "./match-source-files.js";
import { getFromPackageFields } from "./package-fields.js";
import { readPackageJson } from "./package.js";
import { getBaseConfig, getViteConfig } from "./vite-config.js";
import { deriveOutputDirectory } from "./derive-output-directory.js";
import { deriveEntrypoints } from "./derive-entrypoints.js";

export const pkg = readPackageJson();
export const exports = getExports(pkg);
export const packageFields = getFromPackageFields(pkg);

export const outDir = deriveOutputDirectory(exports, packageFields);
export const entrypoints = deriveEntrypoints(outDir, exports, packageFields);

matchSourceFiles(entrypoints);

export const baseViteConfig = getBaseConfig(outDir, entrypoints);

export const viteConfig = getViteConfig(baseViteConfig);

export const build = async () => await viteBuild(await viteConfig);
