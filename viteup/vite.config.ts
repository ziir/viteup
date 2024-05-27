import { defineConfig } from "vite";
import swc from "vite-plugin-swc-transform";

export default defineConfig({
	plugins: [
		swc({
			swcOptions: {
				jsc: {
					target: "es2022",
				},
			},
		}),
	],
});
