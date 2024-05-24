import path from "node:path";
import {
	SUPPORTED_EXPORT_CONDITIONS,
	type ConditionalValue,
	type ConditionalValueObject,
	type ExportsSubpaths,
	type PackageFieldEntries,
} from "./types.js";
import { isObject } from "./utils.js";

function isConditionalValueObject(
	conditionalValue: ConditionalValue,
): conditionalValue is ConditionalValueObject {
	return isObject(conditionalValue);
}

function refineOutputDir(previousOutDir: string | null, outputPath: string) {
	const normalizedOutputPath = path.normalize(outputPath);
	const outputPathSplit = normalizedOutputPath.split("/");

	outputPathSplit.pop();
	let outputDir = outputPathSplit.join("/");

	// We previously derived an output directory different than the one
	// we're presently considering, this means we can try to refine either one
	if (previousOutDir !== null && previousOutDir !== outputDir) {
		const a = previousOutDir;
		const b = outputDir;

		outputDir = "";
		for (let i = 0; i < a.length && i < b.length; i++) {
			if (a[i] !== b[i]) {
				break;
			}
			outputDir += a[i];
		}
	}

	return outputDir;
}

function lookupConditionalValueObject({
	outDir,
	exportPath,
	conditionalValue,
}: {
	outDir: string | null;
	exportPath: string;
	conditionalValue: ConditionalValueObject;
}) {
	let result = outDir;

	for (const condition of SUPPORTED_EXPORT_CONDITIONS) {
		const candidate = conditionalValue[condition];

		if (candidate === undefined || candidate === null) {
			continue;
		}

		if (isConditionalValueObject(candidate)) {
			result = lookupConditionalValueObject({
				outDir: result,
				exportPath,
				conditionalValue: candidate,
			});
			continue;
		}

		if (typeof candidate !== "string" || candidate === "") {
			throw new Error(
				`Package export "${exportPath}" does not include a valid "${condition}" conditional value`,
			);
		}

		const outputPath = candidate;
		const outputDir = refineOutputDir(outDir, outputPath);

		if (outputDir === "") {
			throw new Error(
				`Package export "${exportPath}" exhibits a different, incompatible output directory than previously derived output directory ("${result}")`,
			);
		}

		result = outputDir;
	}

	return result;
}

export function lookupExports(outDir: string | null, exports: ExportsSubpaths) {
	let result = outDir;
	const exportEntries = Object.entries(exports);

	for (const [exportPath, conditionalValue] of exportEntries) {
		if (exportPath.endsWith(".json")) continue;

		if (!isConditionalValueObject(conditionalValue)) {
			throw new Error(
				`Package export "${exportPath}" does not include a valid conditional value`,
			);
		}

		result = lookupConditionalValueObject({
			outDir: result,
			exportPath,
			conditionalValue,
		});
	}

	return result;
}

export function lookupPackageFieldEntries(
	outDir: string | null,
	packageFields:
		| PackageFieldEntries<"module">
		| PackageFieldEntries<"bin">
		| PackageFieldEntries<"module" | "bin">,
): string | null {
	let result = outDir;

	for (const [field, packageFieldEntry] of Object.entries(packageFields)) {
		for (const [, outputPath] of Object.entries(packageFieldEntry.value)) {
			const outputDir = refineOutputDir(result, outputPath);

			if (outputDir === "") {
				throw new Error(
					`Package field "${field}" exhibits a different, incompatible output directory than previously derived output directory ("${result}")`,
				);
			}
			result = outputDir;
		}
	}

	return result;
}

export function deriveOutputDirectory(
	exports: ExportsSubpaths,
	packageFields:
		| PackageFieldEntries<"module">
		| PackageFieldEntries<"bin">
		| PackageFieldEntries<"module" | "bin">,
): string {
	let outDir: string | null = null;

	outDir = lookupExports(outDir, exports);

	if (packageFields) {
		outDir = lookupPackageFieldEntries(outDir, packageFields);
	}

	if (!outDir) {
		throw new Error(
			"Unable to determine output directory from package.json exports.",
		);
	}

	return outDir;
}
