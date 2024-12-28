import fs from "node:fs";
import path from "node:path";
import {
  SUPPORTED_SOURCE_FILES_DIRECTORIES,
  SUPPORTED_SOURCE_FILES_EXTENSIONS,
} from "./types.ts";

export function checkSourceFileExists(
  localSourcePath: string,
  pathToPackage = ".",
) {
  const sourceFilePath = path.join(pathToPackage, localSourcePath);
  return fs.existsSync(sourceFilePath);
}

export function matchSourceFile(
  derivedEntryPointCandidate: string,
  pathToPackage = ".",
) {
  for (const extensionCandidate of SUPPORTED_SOURCE_FILES_EXTENSIONS) {
    for (const sourceDirectoryCandidate of SUPPORTED_SOURCE_FILES_DIRECTORIES) {
      const entryPointPathCandidate = `${derivedEntryPointCandidate}${extensionCandidate}`;
      const localSourcePathCandidate = path.normalize(
        path.join(sourceDirectoryCandidate, entryPointPathCandidate),
      );
      const exists = checkSourceFileExists(
        localSourcePathCandidate,
        pathToPackage,
      );
      if (exists) {
        return localSourcePathCandidate;
      }
    }
  }

  return null;
}
