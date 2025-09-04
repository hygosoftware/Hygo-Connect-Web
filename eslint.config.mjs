import { dirname } from "path";
import { fileURLToPath } from "url";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import importPlugin from "eslint-plugin-import";
import globals from "globals";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/out/**",
      "**/build/**",
      "**/dist/**",
      "**/coverage/**",
      "**/public/sw.js",
      "**/public/workbox-*.js",
    ],
  },
  // Base: turn off core no-unused-vars globally; we'll enable per-filetype as needed
  {
    rules: {
      "no-unused-vars": "off",
    },
  },
  js.configs.recommended,
  // TypeScript rules will be applied in the TS/TSX override below
  // TypeScript overrides and options applied ONLY to TS/TSX files
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: true,
        tsconfigRootDir: __dirname,
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "@typescript-eslint": tseslint.plugin,
      "import": importPlugin,
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      // TypeScript already checks undefined identifiers
      "no-undef": "off",
      // Use the TS rule instead of the base one for TS files
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
      ],
    },
  },
  // JS settings (JS/JSX/MJS/CJS) with standard globals
  {
    files: ["**/*.{js,jsx,mjs,cjs}"],
    languageOptions: {
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      "import": importPlugin,
    },
    rules: {
      // Ensure TS-only rules don't run on JS config files
      "@typescript-eslint/await-thenable": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      // For JS files, keep base rule but only as a warning and allow underscore ignores
      "no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
      ],
    },
  },
];
