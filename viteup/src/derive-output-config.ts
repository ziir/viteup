import path from "node:path";
import {
  SUPPORTED_EXPORT_CONDITIONS,
  type ConditionalValue,
  type ConditionalValueObject,
  type PackageFieldEntries,
  type Exports,
  type PackageFieldEntryTypeValuePair,
  type PackageFieldEntryTypeValueMap,
  type SupportedPackageField,
  type SupportedModuleFormat,
  type PackageType,
  isValueMap,
  type DerivedOutputConfig,
  type OutputConfigInit,
} from "./types.ts";
import { isObject } from "./utils.ts";
import { shouldSkipExport } from "./exports.ts";

function getModuleFormatForCondition(
  packageType: PackageType,
  condition: (typeof SUPPORTED_EXPORT_CONDITIONS)[number],
  outputPath: string,
): SupportedModuleFormat {
  switch (condition) {
    case "import":
    case "module":
      return "module";
    case "require":
      return "commonjs";
    case "default": {
      const extname = path.extname(outputPath);
      return extname === ".mjs"
        ? "module"
        : extname === ".cjs"
          ? "commonjs"
          : packageType;
    }
    default:
      throw new Error(
        "Cannot determine module format for unsupported condition",
      );
  }
}

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

function refineOutputConfig(
  outputConfig: OutputConfigInit,
  moduleFormat: SupportedModuleFormat,
  outputPath: string,
) {
  outputConfig.outDir = refineOutputDir(outputConfig.outDir, outputPath);
  // @ts-ignore
  outputConfig[moduleFormat] = true;
}

function lookupConditionalValueObject({
  outputConfig,
  exportPath,
  conditionalValue,
  pkgType,
}: {
  outputConfig: OutputConfigInit;
  exportPath: string;
  conditionalValue: ConditionalValueObject;
  pkgType: PackageType;
}) {
  for (const condition of SUPPORTED_EXPORT_CONDITIONS) {
    const candidate = conditionalValue[condition];

    if (candidate === undefined || candidate === null) {
      continue;
    }

    if (isConditionalValueObject(candidate)) {
      lookupConditionalValueObject({
        outputConfig,
        exportPath,
        conditionalValue: candidate,
        pkgType,
      });
      continue;
    }

    if (typeof candidate !== "string" || candidate === "") {
      throw new Error(
        `Package export "${exportPath}" does not include a valid "${condition}" conditional value`,
      );
    }

    const outputPath = candidate;
    const moduleFormat = getModuleFormatForCondition(
      pkgType,
      condition,
      outputPath,
    );
    refineOutputConfig(outputConfig, moduleFormat, outputPath);

    // biome-ignore lint/style/noNonNullAssertion: outDir was refined earlier, type string is guaranteed
    if (outputConfig.outDir! === "") {
      throw new Error(
        `Package export "${exportPath}" exhibits an incompatible output directory`,
      );
    }
  }
}

export function lookupExports(
  outputConfig: OutputConfigInit,
  exports: Exports,
  pkgType: PackageType,
) {
  if (typeof exports === "string") {
    refineOutputConfig(outputConfig, pkgType, exports);
    return;
  }

  if (Array.isArray(exports)) {
    throw new Error("Package exports of type Array is not yet supported");
  }

  for (let [exportPath, conditionalValue] of Object.entries(exports)) {
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
      outputConfig,
      exportPath,
      conditionalValue,
      pkgType,
    });
  }
}

export function lookupPackageFieldEntryValue(
  outputConfig: OutputConfigInit,
  field: SupportedPackageField,
  packageFieldEntryValue:
    | Record<string, PackageFieldEntryTypeValuePair>
    | PackageFieldEntryTypeValueMap,
) {
  if (isValueMap(packageFieldEntryValue)) {
    const { type } = packageFieldEntryValue;
    for (const [, innerValue] of Object.entries(packageFieldEntryValue.value)) {
      refineOutputConfig(outputConfig, type, innerValue);
      // biome-ignore lint/style/noNonNullAssertion: outDir was refined earlier, type string is guaranteed
      if (outputConfig.outDir! === "") {
        throw new Error(
          `Package field "${field}" exhibits an incompatible output directory`,
        );
      }
    }
  } else {
    for (const [, { type, value }] of Object.entries(packageFieldEntryValue)) {
      refineOutputConfig(outputConfig, type, value);
      // biome-ignore lint/style/noNonNullAssertion: outDir was refined earlier, type string is guaranteed
      if (outputConfig.outDir! === "") {
        throw new Error(
          `Package field "${field}" exhibits an incompatible output directory`,
        );
      }
    }
  }
}

export function lookupPackageFieldEntries(
  outputConfig: OutputConfigInit,
  packageFields:
    | PackageFieldEntries<"main">
    | PackageFieldEntries<"main" | "module">
    | PackageFieldEntries<"main" | "bin">
    | PackageFieldEntries<"module">
    | PackageFieldEntries<"module" | "bin">
    | PackageFieldEntries<"bin">,
) {
  for (const [field, packageFieldEntry] of Object.entries(packageFields)) {
    lookupPackageFieldEntryValue(
      outputConfig,
      field as SupportedPackageField,
      packageFieldEntry.value,
    );
  }
}

export function deriveOutputConfig(
  exports: Exports | undefined,
  pkgType: PackageType,
  packageFields:
    | PackageFieldEntries<"main">
    | PackageFieldEntries<"main" | "module">
    | PackageFieldEntries<"main" | "bin">
    | PackageFieldEntries<"module">
    | PackageFieldEntries<"module" | "bin">
    | PackageFieldEntries<"bin">,
): DerivedOutputConfig {
  const outputConfig: OutputConfigInit = {
    outDir: null,
  };

  if (exports) {
    lookupExports(outputConfig, exports, pkgType);
  }

  if (packageFields) {
    lookupPackageFieldEntries(outputConfig, packageFields);
  }

  if (!outputConfig.outDir) {
    throw new Error(
      "Unable to determine output directory from package.json exports.",
      { cause: { outputConfig, exports, packageFields } },
    );
  }

  const derivedOutputConfig = outputConfig as DerivedOutputConfig;

  if (
    !("commonjs" in derivedOutputConfig && derivedOutputConfig.commonjs) &&
    !("module" in derivedOutputConfig && derivedOutputConfig.module)
  ) {
    throw new Error(
      "Unable to determine output format(s) from package.json exports.",
      { cause: { outputConfig } },
    );
  }

  return derivedOutputConfig;
}
