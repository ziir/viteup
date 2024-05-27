import type {
	PackageFieldEntries,
	PackageFieldEntry,
	PackageJson,
} from "./types.js";
import { isObject } from "./utils.js";

const SUPPORTED_FIELD_GETTERS = [
	{
		name: "module",
		get: function (pkg: PackageJson): null | PackageFieldEntry {
			if (!(this.name in pkg)) {
				return null;
			}

			const fieldValue = pkg[this.name];
			if (typeof fieldValue !== "string" || !fieldValue) {
				throw new Error("package.json['module'] must be a string path");
			}

			const { get, ...base } = this;
			return { ...base, value: { ".": fieldValue } };
		},
	},
	{
		name: "bin",
		get: function (pkg: PackageJson): null | PackageFieldEntry {
			if (!(this.name in pkg)) {
				return null;
			}

			let value = pkg[this.name];
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

			const { get, ...base } = this;
			return { ...base, value: value as Record<string, string> };
		},
	},
] as const;

export function getFromPackageFields(pkg: PackageJson) {
	return SUPPORTED_FIELD_GETTERS.reduce((acc, curr) => {
		const result = curr.get(pkg);
		if (result) {
			acc[result.name] = result;
		}
		return acc;
	}, {} as PackageFieldEntries);
}
