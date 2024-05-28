import type {
	ConditionalValue,
	ConditionalValueObject,
	Exports,
	ExportsSubpaths,
} from "resolve-import";
import { isObject } from "./utils";
export type {
	Exports,
	ConditionalValue,
	ConditionalValueObject,
	ExportsSubpaths,
};

export const PACKAGE_TYPES = ["commonjs", "module"] as const;
export type PackageType = (typeof PACKAGE_TYPES)[number];

export type PackageJson = {
	name: string;
	version: string;
	type?: PackageType;
	main?: string;
	module?: string;
	bin?: Record<string, string> | string;
	exports?: Exports;
	[key: string]: unknown;
};

export type SupportedModuleFormat = "commonjs" | "module";
export type PackageFieldEntryType = PackageType;
export type PackageFieldEntryPathValue = string;
export type PackageFieldEntryTypeValuePair = {
	type: PackageFieldEntryType;
	value: PackageFieldEntryPathValue;
};
export type PackageFieldEntryTypeValueMap = {
	type: PackageFieldEntryType;
	value: Record<string, PackageFieldEntryPathValue>;
};

export type SupportedPackageField = "main" | "module" | "bin";

export type PackageFieldEntry<
	T extends SupportedPackageField = SupportedPackageField,
> = {
	name: T;
	value: T extends "main" | "module"
		? Record<string, PackageFieldEntryTypeValuePair>
		: T extends "bin"
			? PackageFieldEntryTypeValueMap
			: never;
};

export type PackageFieldEntries<
	T extends PackageFieldEntry["name"] = PackageFieldEntry["name"],
> = Record<T, PackageFieldEntry>;

export const SUPPORTED_EXPORT_CONDITIONS = [
	"require",
	"import",
	"module",
	"default",
] as const;

export function isConditionalValueObject(
	conditionalValue: ConditionalValue,
): conditionalValue is ConditionalValueObject {
	return isObject(conditionalValue);
}

export type DerivedOutputConfig = {
	outDir: string;
} & ({ commonjs: true } | { module: true } | { commonjs: true; module: true });

export type OutputConfigInit = {
	outDir: DerivedOutputConfig["outDir"] | null;
};

export function isValueMap(
	x:
		| Record<string, PackageFieldEntryTypeValuePair>
		| PackageFieldEntryTypeValueMap,
): x is PackageFieldEntryTypeValueMap {
	return "value" in x;
}

export const SUPPORTED_SOURCE_FILES_EXTENSIONS = [
	".ts",
	".tsx",
	".jsx",
	".js",
] as const;

export const SUPPORTED_SOURCE_FILES_DIRECTORIES = ["src", ""] as const;
