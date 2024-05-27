import path from "node:path";
import {
	isConditionalValueObject,
	type ConditionalValueObject,
	type ExportsSubpaths,
	type PackageFieldEntries,
	SUPPORTED_EXPORT_CONDITIONS,
} from "./types.js";

function lookupConditionalValueObject({
	entrypoints,
	outDir,
	exportPath,
	conditionalValue,
}: {
	entrypoints: Record<string, string>;
	outDir: string;
	exportPath: string;
	conditionalValue: ConditionalValueObject;
}) {
	for (const condition of SUPPORTED_EXPORT_CONDITIONS) {
		const candidate = conditionalValue[condition];

		if (!candidate) {
			continue;
		}

		if (isConditionalValueObject(candidate)) {
			lookupConditionalValueObject({
				entrypoints,
				outDir,
				exportPath,
				conditionalValue: candidate,
			});
			continue;
		}

		if (typeof candidate !== "string") {
			throw new Error(
				`Package export "${exportPath}" does not include a valid "${condition}" conditional value`,
			);
		}

		const outputPath = candidate;
		const normalizedOutputPath = path.normalize(outputPath);

		const relativeOutputPath = path.relative(outDir, normalizedOutputPath);

		const relativeOutputPathNoExtName = relativeOutputPath.replace(
			path.extname(relativeOutputPath),
			"",
		);

		const name = relativeOutputPathNoExtName.replace("/index", "");
		const sourceFilePathNoExt = path.join("./src", relativeOutputPathNoExtName);
		const value = `./${sourceFilePathNoExt}`;

		if (entrypoints[name] && entrypoints[name] !== value) {
			throw new Error(
				`Package export "${exportPath}" has a conflicting entrypoint name ("${name}") with another entrypoint`,
			);
		}

		entrypoints[name] = value;
	}
}

export function lookupExports(
	entrypoints: Record<string, string>,
	outDir: string,
	exports: ExportsSubpaths,
) {
	const exportEntries = Object.entries(exports);

	for (const [exportPath, conditionalValue] of exportEntries) {
		if (exportPath.endsWith(".json")) continue;

		if (!isConditionalValueObject(conditionalValue)) {
			throw new Error(
				`Package export "${exportPath}" does not include a valid conditional value`,
			);
		}

		lookupConditionalValueObject({
			entrypoints,
			outDir,
			exportPath,
			conditionalValue,
		});
	}
}

export function lookupPackageFieldEntries(
	entrypoints: Record<string, string>,
	outDir: string,
	packageFields:
		| PackageFieldEntries<"module">
		| PackageFieldEntries<"bin">
		| PackageFieldEntries<"module" | "bin">,
) {
	for (const [field, packageFieldEntry] of Object.entries(packageFields)) {
		for (const [, outputPath] of Object.entries(packageFieldEntry.value)) {
			const normalizedOutputPath = path.normalize(outputPath);

			const relativeOutputPath = path.relative(outDir, normalizedOutputPath);

			const relativeOutputPathNoExtName = relativeOutputPath.replace(
				path.extname(relativeOutputPath),
				"",
			);

			const name = relativeOutputPathNoExtName.replace("/index", "");
			const sourceFilePathNoExt = path.join(
				"./src",
				relativeOutputPathNoExtName,
			);
			const value = `./${sourceFilePathNoExt}`;

			if (entrypoints[name] && entrypoints[name] !== value) {
				throw new Error(
					`Package field "${field}" has a conflicting entrypoint name ("${name}") with another entrypoint`,
				);
			}

			entrypoints[name] = value;
		}
	}
}

export function deriveEntrypoints(
	outDir: string,
	exports: ExportsSubpaths,
	packageFields?:
		| PackageFieldEntries<"module">
		| PackageFieldEntries<"bin">
		| PackageFieldEntries<"module" | "bin">,
): Record<string, string> {
	const entrypoints: Record<string, string> = {};

	lookupExports(entrypoints, outDir, exports);

	if (packageFields) {
		lookupPackageFieldEntries(entrypoints, outDir, packageFields);
	}

	if (!Object.keys(entrypoints).length) {
		throw new Error("Unable to determine entry points");
	}

	return entrypoints;
}
