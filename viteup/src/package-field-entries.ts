import path from "node:path";
import type {
  PackageFieldEntries,
  PackageFieldEntry,
  PackageJson,
  PackageType,
} from "./types.ts";

const SUPPORTED_FIELD_GETTERS = [
  {
    name: "main",
    get: function (
      pkgType: PackageType,
      pkg: PackageJson,
    ): null | PackageFieldEntry<"main"> {
      const { name: fieldName } = this;

      if (!(fieldName in pkg)) {
        return null;
      }

      const fieldValue = pkg[fieldName];
      if (typeof fieldValue !== "string" || !fieldValue) {
        throw new Error("package.json['main'] must be a string path");
      }

      const type =
        pkgType !== "commonjs" && path.extname(fieldValue) === ".cjs"
          ? "commonjs"
          : pkgType;

      return {
        name: fieldName,
        value: { ".": { type, value: fieldValue } },
      };
    },
  },
  {
    name: "module",
    get: function (
      pkgType: PackageType,
      pkg: PackageJson,
    ): null | PackageFieldEntry<"module"> {
      const { name: fieldName } = this;

      if (!(fieldName in pkg)) {
        return null;
      }

      const fieldValue = pkg[fieldName];
      if (typeof fieldValue !== "string" || !fieldValue) {
        throw new Error("package.json['module'] must be a string path");
      }

      return {
        name: fieldName,
        value: { ".": { type: "module", value: fieldValue } },
      };
    },
  },
  {
    name: "bin",
    get: function (
      pkgType: PackageType,
      pkg: PackageJson,
    ): null | PackageFieldEntry<"bin"> {
      const { name: fieldName } = this;

      if (!(fieldName in pkg)) {
        return null;
      }

      let value = pkg[fieldName];

      if (!value) {
        throw new Error("package.json['bin'] cannot be empty");
      }

      if (typeof value === "string") {
        value = { [pkg.name]: value };
      }

      if (
        Object.entries(value as Record<string, string>).some(
          ([key, val]) => !key || !val,
        )
      ) {
        throw new Error("package.json['bin'] is invalid");
      }

      const type = pkgType;

      return {
        name: fieldName,
        value: { type, value: value },
      };
    },
  },
] as const;

export function getPackageFieldEntries(pkgType: PackageType, pkg: PackageJson) {
  return SUPPORTED_FIELD_GETTERS.reduce((acc, curr) => {
    const result = curr.get(pkgType, pkg);
    if (result) {
      acc[result.name] = result;
    }
    return acc;
  }, {} as PackageFieldEntries);
}
