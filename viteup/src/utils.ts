import { SUPPORTED_EXPORT_CONDITIONS } from "./types.ts";

export function isObject(obj: unknown) {
  return typeof obj === "object" && obj !== null;
}

export function shouldSkipExport(exportPath: string) {
  const bar = exportPath.split(/^\.?\//, 2);
  if (bar[1] && bar[1].indexOf(".") === -1) {
    // check directory
    if (exportPath.slice(-1) === "/") {
      return true;
    }
  } else if (exportPath !== ".") {
    if (SUPPORTED_EXPORT_CONDITIONS.some((ext) => !exportPath.endsWith(ext))) {
      return true;
    }
  }
  return false;
}
