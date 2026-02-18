import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/index.ts"],
    format: ["cjs"],
    dts: true,
    outDir: "dist",
    clean: true,
    sourcemap: true,
    external: ["drizzle-orm", "postgres", "dotenv"],
});
