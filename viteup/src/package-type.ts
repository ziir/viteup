import type { PackageJson, PackageType } from "./types";

export function getPackageType(pkg: PackageJson): PackageType {
  if (!("type" in pkg)) return "commonjs";
  if (pkg.type === undefined || !["commonjs", "module"].includes(pkg.type)) {
    throw new Error(
      "package.json['type'] must be type?: 'commonjs' | 'module'",
    );
  }

  return pkg.type;
}
