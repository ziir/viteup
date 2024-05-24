import fs from "node:fs";
import path from "node:path";

const SUPPORTED_SOURCE_FILES_EXTENSIONS = [".ts", ".tsx", ".jsx"] as const;

export function matchSourceFiles(
	entryPoints: Record<string, string>,
	pathToPackage = ".",
) {
	for (const [sourceEntryPointName, sourceEntryPoint] of Object.entries(
		entryPoints,
	)) {
		for (const extensionCandidate of SUPPORTED_SOURCE_FILES_EXTENSIONS) {
			const sourceFilePathCandidate = `${sourceEntryPoint}${extensionCandidate}`;
			const sourceFilePath = path.join(pathToPackage, sourceFilePathCandidate);
			const exists = fs.existsSync(sourceFilePath);
			if (exists) {
				entryPoints[sourceEntryPointName] = sourceFilePath;
				break;
			}
		}

		if (entryPoints[sourceEntryPointName] === sourceEntryPoint) {
			throw new Error(
				`No source file with supported extension ("${SUPPORTED_SOURCE_FILES_EXTENSIONS.join(
					", ",
				)}") found for source entry point "${sourceEntryPoint}"`,
			);
		}
	}
}
