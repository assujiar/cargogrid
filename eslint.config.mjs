import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

const config = [
  {
    ignores: ["node_modules/**", "coverage/**", "dist/**", ".next/**"]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.js", "**/*.mjs", "**/*.ts", "**/*.tsx"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node
      }
    }
import nextVitals from "eslint-config-next/core-web-vitals";

const config = [
  ...nextVitals,
  {
    ignores: [".next/**", "node_modules/**", "next-env.d.ts"]
  }
];

export default config;
