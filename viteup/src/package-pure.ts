import { readFileSync } from "node:fs";
import path from "node:path";
import type { PackageJson } from "./types.ts";

export function readPackageJson(pathToPackage = ".") {
  try {
    return JSON.parse(
      readFileSync(path.join(pathToPackage, "package.json"), "utf8"),
    ) as PackageJson;
  } catch (err) {
    throw new Error("Failed to read package.json", { cause: err });
  }
}
