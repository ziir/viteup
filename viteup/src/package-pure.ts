import { readFileSync } from "node:fs";
import path from "node:path";
import type { PackageJson } from "./types.js";

export function readPackageJson(pathToPackage = ".") {
	try {
		return JSON.parse(
			readFileSync(path.join(pathToPackage, "package.json"), "utf8"),
		) as PackageJson;
	} catch (err) {
		console.error("failed to read package.json");
		console.error(err);
		throw err;
	}
}
