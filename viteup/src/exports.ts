import { extname } from "node:path";
import { SUPPORTED_SOURCE_FILES_EXTENSIONS } from "./types.ts";

const mutableWideSuppFileExts = [
  ...SUPPORTED_SOURCE_FILES_EXTENSIONS,
] as Array<string>;

export function shouldSkipExport(exportPath: string): boolean {
  if (exportPath === ".") return false;
  if (exportPath.endsWith("/")) return true;

  const normalized = exportPath.split(/^\.?\//, 2)?.[1] ?? exportPath;
  const ext = extname(normalized);
  return !!ext && !mutableWideSuppFileExts.includes(ext);
}
