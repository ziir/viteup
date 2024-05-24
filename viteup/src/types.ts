import type {
	ConditionalValue,
	ConditionalValueObject,
	ExportsSubpaths,
} from "resolve-import";
import { isObject } from "./utils";
export type { ConditionalValue, ConditionalValueObject, ExportsSubpaths };

export type PackageJson = {
	name: string;
	version: string;
	type?: "module";
	module?: string;
	bin?: Record<string, string> | string;
	exports?: ExportsSubpaths;
	[key: string]: unknown;
};

export type PackageFieldEntry<T extends "module" | "bin" = "module" | "bin"> = {
	name: T;
	value: Record<string, string>;
};

export type PackageFieldEntries<
	T extends PackageFieldEntry["name"] = PackageFieldEntry["name"],
> = Record<T, PackageFieldEntry>;

export const SUPPORTED_EXPORT_CONDITIONS = [
	"import",
	"module",
	"default",
] as const;

export function isConditionalValueObject(
	conditionalValue: ConditionalValue,
): conditionalValue is ConditionalValueObject {
	return isObject(conditionalValue);
}
