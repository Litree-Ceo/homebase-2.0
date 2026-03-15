import { dirname } from 'path';
import { fileURLToPath } from 'url';
import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import globals from 'globals';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const eslintConfig = [
  js.configs.recommended,
  {
    ignores: ["**/.next/**", "**/node_modules/**", "**/*.d.ts"],
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
        parser: tsParser,
        parserOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            ecmaFeatures: {
                jsx: true
            }
        },
        globals: {
            ...globals.browser,
            ...globals.node
        }
    },
    plugins: {
        "@typescript-eslint": tsPlugin
    },
    rules: {
        ...tsPlugin.configs.recommended.rules,
        "no-unused-vars": "off",
        "no-undef": "off",
        "@typescript-eslint/no-unused-vars": "warn",
        "@typescript-eslint/no-explicit-any": "warn",
        "@typescript-eslint/no-empty-object-type": "off"
    }
  }
];

export default eslintConfig;
