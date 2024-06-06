import { esbuildPlugin } from '@web/dev-server-esbuild';
import { fileURLToPath } from 'url';

/** @type {import('@web/test-runner').TestRunnerConfig} */
export default {
  nodeResolve: true,
  files: ['test/**/*.test.ts'],
  coverageConfig: {
    report: true,
    reportDir: '.coverage',
    exclude: [
      '**/node_modules/**',
    ],
    threshold: {
      statements: 98.5,
      branches: 95.5,
      functions: 96.5,
      lines: 98.5
    }
  },
  plugins: [
    esbuildPlugin({
      ts: true,
      tsconfig: fileURLToPath(new URL('./tsconfig.json', import.meta.url))
    })
  ]
};
