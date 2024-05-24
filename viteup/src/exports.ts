import type { ExportsSubpaths, PackageJson } from "./types.js";
import { isObject } from "./utils.js";

function isExports(
	exports: PackageJson["exports"],
): exports is ExportsSubpaths {
	return isObject(exports);
}

export function getExports(pkg: PackageJson) {
	if ("exports" in pkg && isExports(pkg.exports)) {
		return pkg.exports;
	}
	return {};
}
