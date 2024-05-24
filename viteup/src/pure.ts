import { build as viteBuild } from "vite";

import { getExports } from "./exports.js";
import { matchSourceFiles } from "./match-source-files.js";
import { getFromPackageFields } from "./package-fields.js";
import { readPackageJson } from "./package-pure.js";
import {
	getBaseConfig,
	getDefaultSwcTransformPluginOptions,
	getViteConfig,
} from "./vite-config.js";
import { deriveOutputDirectory } from "./derive-output-directory.js";
import { deriveEntrypoints } from "./derive-entrypoints.js";

export { getExports };
export { getFromPackageFields };
export { readPackageJson };
export { getDefaultSwcTransformPluginOptions, getViteConfig };

export function getResolvedViteConfig(pathToPackage = ".") {
	const pkg = readPackageJson(pathToPackage);
	const exports = getExports(pkg);
	const packageFields = getFromPackageFields(pkg);

	const outDir = deriveOutputDirectory(exports, packageFields);
	const entrypoints = deriveEntrypoints(outDir, exports, packageFields);
	matchSourceFiles(entrypoints, pathToPackage);

	const baseViteConfig = getBaseConfig(outDir, entrypoints);

	return getViteConfig(baseViteConfig, pathToPackage);
}

export async function build(pathToPackage = ".") {
	const viteConfig = await getResolvedViteConfig(pathToPackage);

	return viteBuild(viteConfig);
}
