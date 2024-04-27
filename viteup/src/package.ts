import { readPackageJson as readPackageJsonPure } from "./package-pure.js";

export function readPackageJson(pathToPackage = ".") {
	try {
		return readPackageJsonPure(pathToPackage);
	} catch (err) {
		process.exit(1);
	}
}
