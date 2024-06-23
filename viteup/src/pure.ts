import { build as viteBuild } from "vite";

import { getPackageFieldEntries } from "./package-field-entries.js";
import { readPackageJson } from "./package-pure.js";
import {
	getBaseConfig,
	getDefaultSwcTransformPluginOptions,
	getViteConfig,
} from "./vite-config.js";
import { deriveOutputConfig } from "./derive-output-config.js";
import { deriveEntrypoints } from "./derive-entrypoints.js";
import { getPackageType } from "./package-type.js";

export { getPackageFieldEntries };
export { readPackageJson };
export { getDefaultSwcTransformPluginOptions, getViteConfig };

export async function getResolvedViteConfig(pathToPackage = ".") {
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

	const baseViteConfig = await getBaseConfig(
		outputConfig,
		entrypoints,
		pathToPackage,
	);

	return getViteConfig(baseViteConfig, pathToPackage);
}

export async function build(pathToPackage = ".") {
	const viteConfig = await getResolvedViteConfig(pathToPackage);

	return viteBuild(viteConfig);
}
