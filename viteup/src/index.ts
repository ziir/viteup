import { build as viteBuild } from "vite";

import { getPackageFieldEntries } from "./package-field-entries.js";
import { readPackageJson } from "./package.js";
import { getBaseConfig, getViteConfig } from "./vite-config.js";
import { deriveOutputConfig } from "./derive-output-config.js";
import { deriveEntrypoints } from "./derive-entrypoints.js";
import { getPackageType } from "./package-type.js";

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

export const build = async () =>
	await viteBuild(
		await getViteConfig(await getBaseConfig(outputConfig, entrypoints)),
	);
