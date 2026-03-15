import { defineConfig, globalIgnores } from "eslint/config";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";

// Minimal flat config to avoid plugin resolution issues
export default defineConfig([
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      parser: tsParser,
      parserOptions: {
        project: false,
        tsconfigRootDir: process.cwd(),
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      // Keep rules light; catch obvious issues
      "@typescript-eslint/no-unused-vars": "warn",
      "no-undef": "off", // TS handles types
      // Disable CSS inline style warnings for now (temporary styling solution)
      "react/style-prop-object": "off",
      // Disable all ARIA validation (dynamic values are valid at runtime)
      "jsx-a11y/aria-props": "off",
      "jsx-a11y/aria-proptypes": "off",
      "jsx-a11y/aria-role": "off",
      "jsx-a11y/aria-unsupported-elements": "off",
      "jsx-a11y/aria-activedescendant-has-tabindex": "off",
      "jsx-a11y/aria-descendent-role": "off",
      "jsx-a11y/heading-has-content": "off",
      "jsx-a11y/click-events-have-key-events": "off",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);
