import { FlatCompat } from "@eslint/eslintrc";
const compat=new FlatCompat({baseDirectory:import.meta.dirname});
export default [
  ...compat.extends("next/core-web-vitals","next/typescript"),
  {ignores:["next-env.d.ts","**/.next/**","**/dist/**","**/out/**","**/playwright-report/**","**/test-results/**"]},
];
