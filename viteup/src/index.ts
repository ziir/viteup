import { build as viteBuild } from "vite";

import { getEntryPoints } from "./entrypoints.js";
import { getExports } from "./exports.js";
import { readPackageJson } from "./package.js";
import { getBaseConfig, getViteConfig } from "./vite-config.js";

export const pkg = readPackageJson();
export const exports = getExports(pkg);
export const entrypoints = getEntryPoints(exports);

export const baseViteConfig = getBaseConfig(entrypoints);
export const viteConfig = getViteConfig(entrypoints);

export const build = async () => await viteBuild(await viteConfig);
