import typescript from "@rollup/plugin-typescript";

import pkg from "./package.json";

export default [
  // CommonJS (for Node) and ES module (for bundlers) build.
  {
    input: "src/index.ts",
    output: [
      {
        file: pkg.main,
        format: "cjs",
      },
      {
        file: pkg.module,
        format: "es",
      },
    ],
    plugins: [typescript()],
  },
];
