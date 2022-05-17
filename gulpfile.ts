import * as bs from 'browser-sync';
import { chmodSync } from 'fs';
import { series, task } from 'gulp';
import { join, resolve } from 'path';
import {
  compileTypeScript,
  copyFilesAsync,
  deleteDir,
  lintESLint,
  modifyFile,
  normalizeCompilerOptions
} from '@tylertech/forge-build-tools';

const tsconfig = require('./tsconfig.json');

const ROOT = __dirname;
const SRC_ROOT = join(ROOT, 'src');
const DIST_ROOT = join(ROOT, 'dist');

/** Serves the test coverage */
task('serve:coverage', () => {
  const browser = bs.create();
  browser.init({
    server: resolve(ROOT, 'spec/coverage/html-report/html'),
    port: 9075,
    notify: false,
    ghostMode: false,
    watch: true
  });
});

/** Cleans the build output directory. */
task('clean', async () => await deleteDir(DIST_ROOT));

/** Lints the code in the project. */
task('lint', () => lintESLint(join(SRC_ROOT, '**/*.ts'), { options: { fix: true }, commitFixes: true}));

/** Compile TypeScript to ES modules. */
task('compile', async () => compileTypeScriptTask());

/** Copies the package.json to the build output directory. */
task('copy:assets', () => {
  const files = [
    join(ROOT, 'package.json'),
    join(ROOT, 'LICENSE'),
    join(ROOT, 'README.md')
  ];
  return copyFilesAsync(files, ROOT, DIST_ROOT);
});

/** Adjusts the package.json to prepare it for public distribution. */
task('fixup:packageJson', async () => {
  const packageJsonPath = join(DIST_ROOT, 'package.json');
  chmodSync(packageJsonPath, 0o777);
  await modifyFile(packageJsonPath, info => {
    const json = JSON.parse(info.contents);
    delete json.devDependencies;
    delete json.scripts;
    return JSON.stringify(json, null, 2);
  });
});

/** The main build task that generates the npm package. */
task('build', series('clean', 'lint', 'compile', 'copy:assets', 'fixup:packageJson'));

async function compileTypeScriptTask(): Promise<void> {
  const compilerOptions = normalizeCompilerOptions(tsconfig.compilerOptions as any) as any;
  compilerOptions.target = 'es2017';
  compilerOptions.module = 'es2015';
  compilerOptions.outDir = join(DIST_ROOT, 'esm');
  compilerOptions.declaration = true;
  compilerOptions.declarationDir = join(DIST_ROOT, 'typings');
  delete compilerOptions.sourceMap;
  return compileTypeScript(join(SRC_ROOT, '**/*.ts'), compilerOptions);
}
