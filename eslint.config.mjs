import { FlatCompat } from "@eslint/eslintrc";
const compat=new FlatCompat({baseDirectory:import.meta.dirname});
const eslintConfig = [
  ...compat.extends("next/core-web-vitals","next/typescript"),
  {ignores:["next-env.d.ts","**/.next/**","**/dist/**","**/out/**","**/playwright-report/**","**/test-results/**","**/.cursor/**","**/.agents/**","**/.claude/**","**/.codex/**","**/.lovable/**","**/.jules/**","**/.tmp-qa/**"]},
];
export default eslintConfig;
