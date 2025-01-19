import path from "node:path";
import {
  isConditionalValueObject,
  type ConditionalValueObject,
  type PackageFieldEntries,
  SUPPORTED_EXPORT_CONDITIONS,
  type Exports,
  type PackageFieldEntryTypeValueMap,
  type PackageFieldEntryTypeValuePair,
  isValueMap,
  type DerivedOutputConfig,
  SUPPORTED_SOURCE_FILES_EXTENSIONS,
} from "./types.ts";
import { matchSourceFile } from "./match-source-files.ts";
import { shouldSkipExport } from "./exports.ts";

export function deriveEntrypoint(
  outDir: string,
  outputPath: string,
  pathToPackage = ".",
) {
  const normalizedOutputPath = path.normalize(outputPath);
  const relativeOutputPath = path.relative(outDir, normalizedOutputPath);
  const relativeOutputPathNoExtName = relativeOutputPath.replace(
    path.extname(relativeOutputPath),
    "",
  );

  const match = matchSourceFile(relativeOutputPathNoExtName, pathToPackage);
  if (!match) {
    throw new Error(
      `No source file with supported extension ("${SUPPORTED_SOURCE_FILES_EXTENSIONS.join(
        ", ",
      )}") found for source entry point "${relativeOutputPathNoExtName}" of "${normalizedOutputPath}"`,
    );
  }

  return { name: match, value: relativeOutputPathNoExtName };
}

function lookupConditionalValueObject({
  entrypoints,
  outDir,
  exportPath,
  conditionalValue,
  pathToPackage = ".",
}: {
  entrypoints: Record<string, string>;
  outDir: string;
  exportPath: string;
  conditionalValue: ConditionalValueObject;
  pathToPackage: string;
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
        pathToPackage,
      });
      continue;
    }

    if (typeof candidate !== "string") {
      throw new Error(
        `Package export "${exportPath}" does not include a valid "${condition}" conditional value`,
      );
    }

    const { name, value } = deriveEntrypoint(outDir, candidate, pathToPackage);
    entrypoints[name] = value;
  }
}

export function lookupExports(
  entrypoints: Record<string, string>,
  outDir: string,
  exports: Exports,
  pathToPackage = ".",
) {
  if (typeof exports === "string") {
    const { name, value } = deriveEntrypoint(outDir, exports);
    entrypoints[name] = value;
    return;
  }

  if (Array.isArray(exports)) {
    throw new Error("Package exports of type Array is not yet supported");
  }

  const exportEntries = Object.entries(exports);

  for (let [exportPath, conditionalValue] of exportEntries) {
    if (shouldSkipExport(exportPath)) continue;

    if (typeof conditionalValue === "string") {
      conditionalValue = { default: conditionalValue };
    }

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
      pathToPackage,
    });
  }
}

export function lookupPackageFieldEntryValue(
  entrypoints: Record<string, string>,
  outDir: string,
  packageFieldEntryValue:
    | Record<string, PackageFieldEntryTypeValuePair>
    | PackageFieldEntryTypeValueMap,
  pathToPackage = ".",
) {
  if (isValueMap(packageFieldEntryValue)) {
    for (const [, innerValue] of Object.entries(packageFieldEntryValue.value)) {
      const { name, value } = deriveEntrypoint(
        outDir,
        innerValue,
        pathToPackage,
      );
      entrypoints[name] = value;
    }
  } else {
    for (const [, { type, value: innerValue }] of Object.entries(
      packageFieldEntryValue,
    )) {
      const { name, value } = deriveEntrypoint(
        outDir,
        innerValue,
        pathToPackage,
      );
      entrypoints[name] = value;
    }
  }
}

export function lookupPackageFieldEntries(
  entrypoints: Record<string, string>,
  outDir: string,
  packageFields:
    | PackageFieldEntries<"main">
    | PackageFieldEntries<"main" | "module">
    | PackageFieldEntries<"main" | "bin">
    | PackageFieldEntries<"module">
    | PackageFieldEntries<"module" | "bin">
    | PackageFieldEntries<"bin">,
  pathToPackage = ".",
) {
  for (const [field, packageFieldEntry] of Object.entries(packageFields)) {
    lookupPackageFieldEntryValue(
      entrypoints,
      outDir,
      packageFieldEntry.value,
      pathToPackage,
    );
  }
}

export function deriveEntrypoints(
  outputConfig: DerivedOutputConfig,
  exports: Exports | undefined,
  packageFields?:
    | PackageFieldEntries<"main">
    | PackageFieldEntries<"main" | "module">
    | PackageFieldEntries<"main" | "bin">
    | PackageFieldEntries<"module">
    | PackageFieldEntries<"module" | "bin">
    | PackageFieldEntries<"bin">,
  pathToPackage = ".",
): Record<string, string> {
  const entrypoints: Record<string, string> = {};

  if (exports) {
    lookupExports(entrypoints, outputConfig.outDir, exports, pathToPackage);
  }

  if (packageFields) {
    lookupPackageFieldEntries(
      entrypoints,
      outputConfig.outDir,
      packageFields,
      pathToPackage,
    );
  }

  if (!Object.keys(entrypoints).length) {
    throw new Error("Unable to determine entry points");
  }

  return entrypoints;
}
