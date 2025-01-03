import { readPackageJson as readPackageJsonPure } from "./package-pure.ts";

export function readPackageJson(pathToPackage = ".") {
  try {
    return readPackageJsonPure(pathToPackage);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
