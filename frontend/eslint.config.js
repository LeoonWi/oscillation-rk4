import js from "@eslint/js"
import ts from "@typescript-eslint/eslint-plugin"
import tsParser from "@typescript-eslint/parser"

export default [
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: "module",
      },
      globals: {
        ...js.configs.recommended.globals,
        browser: true,
        es2021: true,
        node: true,
      },
    },
    plugins: {
      "@typescript-eslint": ts,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...ts.configs.recommended.rules,
      "semi": ["error", "always"],
      "quotes": ["error", "single"],
    },
  },
];