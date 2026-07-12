import { defineConfig } from "eslint/config";
import raycastConfig from "@raycast/eslint-config";

export default defineConfig([
  // Auto-generated from the extension manifest; not meant to be linted.
  { ignores: ["raycast-env.d.ts"] },
  ...raycastConfig,
]);
