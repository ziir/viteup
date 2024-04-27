import type {
	ConditionalValue,
	ConditionalValueObject,
	ExportsSubpaths,
} from "resolve-import";
export type { ConditionalValue, ConditionalValueObject, ExportsSubpaths };

export type PackageJson = {
	name: string;
	version: string;
	type?: "module";
	exports?: ExportsSubpaths;
	[key: string]: unknown;
};
