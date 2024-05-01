import path from "node:path";
import type {
	ConditionalValue,
	ConditionalValueObject,
	ExportsSubpaths,
} from "./types.js";
import { isObject } from "./utils.js";

function isConditionalValueObject(
	conditionalValue: ConditionalValue,
): conditionalValue is ConditionalValueObject {
	return isObject(conditionalValue);
}

function lookupConditionalValueObject({
	entries,
	exportPath,
	conditionalValue,
}: {
	entries: Record<string, string>;
	exportPath: string;
	conditionalValue: ConditionalValueObject;
}) {
	if (!("source" in conditionalValue)) {
		for (const [, innerConditionalValue] of Object.entries(conditionalValue)) {
			if (!isConditionalValueObject(innerConditionalValue)) {
				continue;
			}
			return lookupConditionalValueObject({
				entries,
				exportPath,
				conditionalValue: innerConditionalValue,
			});
		}
		return;
	}

	if (
		!(typeof conditionalValue.source === "string") ||
		conditionalValue.source === ""
	) {
		throw new Error(
			`Package export "${exportPath}" does not include a valid "source" field with matching source file relative path`,
		);
	}

	const { source } = conditionalValue;

	const name =
		exportPath === "."
			? path.relative(
					source.split("/")[1] ?? "",
					source.slice(0, source.length - path.extname(source).length),
				)
			: exportPath.replace("./", "");
	entries[name] = source;
}

export function getEntryPoints(exports: ExportsSubpaths) {
	const entries: Record<string, string> = {};
	const exportEntries = Object.entries(exports);

	if (!exportEntries.length) {
		throw new Error(
			"Missing package exports in package.json, unable to determine entry points",
		);
	}

	for (const [exportPath, conditionalValue] of exportEntries) {
		if (!isConditionalValueObject(conditionalValue)) {
			continue;
		}

		lookupConditionalValueObject({ entries, exportPath, conditionalValue });
	}

	if (!Object.keys(entries).length) {
		throw new Error(
			`Missing package exports including valid "source" field with matching source file relative path`,
		);
	}

	return entries;
}
