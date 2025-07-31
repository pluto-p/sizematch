import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: ["**/__tests__/**/*.ts", "**/*.test.ts", "**/*.spec.ts"],
    rules: {
      // Allow 'any' in test files
      "@typescript-eslint/no-explicit-any": "off",
      // Allow unused variables in tests (useful for test setup)
      "@typescript-eslint/no-unused-vars": "off",
      // Allow Function types in tests
      "@typescript-eslint/no-unsafe-function-type": "off",
      // Allow ts-ignore comments in tests
      "@typescript-eslint/ban-ts-comment": "off"
    }
  }
];

export default eslintConfig;
