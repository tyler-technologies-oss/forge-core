import { task, series } from 'gulp';
import { join, resolve } from 'path';
import { chmodSync } from 'fs';
import * as bs from 'browser-sync';
import {
  compileTypeScript,
  deleteDir,
  copyFilesAsync,
  lintESLint,
  modifyFile,
  normalizeCompilerOptions,
  createRollupBundle,
  IRollupBundleConfig,
  executeWebpack
} from '@tylertech/forge-build-tools';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { Configuration, Stats } from 'webpack';
import TerserPlugin from 'terser-webpack-plugin';

const packageJson = require('./package.json');
const tsconfig = require('./tsconfig.json');

export const ROOT = __dirname;
export const SRC_ROOT = join(ROOT, 'src');
export const DIST_ROOT = join(ROOT, 'dist');
export const BUILD_ROOT = join(ROOT, 'dist/build');
export const BANNER = `/**
* @license
* Copyright (c) ${new Date().getFullYear()} Tyler Technologies, Inc.
* License: Apache-2.0
*/`;

export type WebpackConfigurationFactory = (env: IWebpackEnv) => Configuration;

export interface IWebpackEnv {
  root: string;
  packageName: string;
  tsconfigPath: string;
  entry: { [key: string]: string };
  outputDir: string;
  minify: boolean;
  fileNamePrefix: string;
  globalVariableName: string | string[];
  mode?: 'production' | 'development' | 'none';
  cache?: boolean;
  clean?: boolean;
  beautify?: boolean;
  component?: string;
  libraryTarget?: string;
  devtool?: IDevtoolConfig;
  externals?: any;
}

export interface IDevtoolConfig {
  production: string;
  development: string;
}

const PACKAGE_NAME = packageJson.name;
const OUTPUT_FILENAME = PACKAGE_NAME.includes('/') ? PACKAGE_NAME.split('/')[1] : PACKAGE_NAME;
const PACKAGE_VERSION = packageJson.version;
const ROLLUP_GLOBALS = {
  'tslib': 'tslib',
  '@floating-ui/dom': '@floating-ui/dom'
};

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

/** Creates the rollup bundles. */
task('generate:bundles', async () => {
  const esm2015BuildRoot = join(DIST_ROOT, 'esm');
  const tsconfigPath = join(ROOT, 'tsconfig.json');

  // First we compile to es2015
  await compileTypeScriptTask('es2015', 'es2015', esm2015BuildRoot, true);

  // Create the webpack bundle
  const env: IWebpackEnv = {
    root: esm2015BuildRoot,
    mode: 'production',
    packageName: PACKAGE_NAME,
    tsconfigPath,
    entry: { core: `${esm2015BuildRoot}/index.js` },
    outputDir: join(DIST_ROOT, 'dist'),
    clean: false,
    beautify: false,
    minify: true,
    externals: {},
    fileNamePrefix: 'forge',
    globalVariableName: 'Forge'
  };
  const stats = await executeWebpack(env, getWebpackConfigurationFactory()) as Stats;
  if (stats.hasErrors()) {
    console.log(stats.compilation.errors);
  }

  // Create cjs module bundle
  const rollupConfigCjs: IBundleConfig = {
    name: PACKAGE_NAME,
    input: join(esm2015BuildRoot, 'index.js'),
    file: join(DIST_ROOT, `dist/${OUTPUT_FILENAME}.cjs.js`),
    format: 'cjs',
    version: PACKAGE_VERSION,
    minify: false
  };
  await createRollupBundleTask(rollupConfigCjs, ROLLUP_GLOBALS);

  // Create flat ES module bundle
  const rollupConfigESM: IBundleConfig = {
    name: PACKAGE_NAME,
    input: join(esm2015BuildRoot, 'index.js'),
    file: join(DIST_ROOT, `dist/${OUTPUT_FILENAME}.js`),
    format: 'es',
    version: PACKAGE_VERSION,
    minify: false
  };
  await createRollupBundleTask(rollupConfigESM, ROLLUP_GLOBALS);
});

/** Copies the package.json to the build output directory. */
task('copy:packageJson', () => copyFilesAsync(join(ROOT, 'package.json'), ROOT, DIST_ROOT));

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
task('build', series('clean', 'lint', 'generate:bundles', 'copy:packageJson', 'fixup:packageJson'));

export interface IBundleConfig {
  input: string;
  name: string;
  format: 'es' | 'cjs';
  file: string;
  version: string;
  minify: boolean;
}

async function createRollupBundleTask(rollupConfig: IBundleConfig, rollupGlobals: { [key: string]: string }): Promise<void> {
  const bundleConfig: IRollupBundleConfig = {
    input: rollupConfig.input,
    name: rollupConfig.name,
    format: rollupConfig.format,
    file: rollupConfig.file,
    version: rollupConfig.version,
    minify: rollupConfig.minify,
    globals: rollupGlobals,
    banner: BANNER,
    plugins: [
      nodeResolve(),
      commonjs()
    ]
  };

  await createRollupBundle(bundleConfig);
}

async function compileTypeScriptTask(target: string, mod: string, outputDir: string, declaration?: boolean): Promise<void> {
  const compilerOptions = normalizeCompilerOptions(tsconfig.compilerOptions as any) as any;
  compilerOptions.target = target;
  compilerOptions.module = mod;
  compilerOptions.outDir = outputDir;
  delete compilerOptions.sourceMap;
  
  if (declaration) {
    compilerOptions.declaration = true;
    compilerOptions.declarationDir = join(DIST_ROOT, 'typings');
  }

  return compileTypeScript(join(SRC_ROOT, '**/*.ts'), compilerOptions);
}

function getWebpackConfigurationFactory(): WebpackConfigurationFactory {
  return (env: IWebpackEnv) => {
    if (!env.mode) {
      env.mode = 'production';
    }

    const devSourcemap = env.devtool && env.devtool.development ? env.devtool.development : 'eval-source-map';
    const prodSourcemap = env.devtool && env.devtool.production ? env.devtool.production : 'source-map';
    const libraryVariable = env.globalVariableName instanceof Array ? [...env.globalVariableName, '[name]'] : [env.globalVariableName, '[name]'];

    const config: Configuration = {
      mode: env.mode,
      entry: env.entry,
      cache: env.cache,
      resolve: {
        extensions: ['.ts', '.js']
      },
      output: {
        path: resolve(env.root, env.outputDir),
        filename: `${env.fileNamePrefix}-[name].min.js`,
        publicPath: env.outputDir,
        library: libraryVariable,
        libraryTarget: env.libraryTarget || 'umd'
      },
      devtool: env.mode === 'development' ? devSourcemap : prodSourcemap,
      performance: {
        hints: false
      },
      optimization: {
        emitOnErrors: false,
        concatenateModules: env.mode === 'production',
        usedExports: true,
        sideEffects: true,
        providedExports: true,
        minimize: true,
        minimizer: []
      },
      module: {
        rules: [
          {
            test: /\.m?js/,
            resolve: {
              fullySpecified: false
            }
          }
        ]
      }
    };

    if (env.mode === 'production') {
      if (env.minify) {
        config.optimization?.minimizer?.push(new TerserPlugin({
          terserOptions: {
            output: {
              beautify: env.beautify
            }
          }
        }));
      }
    }

    return config;
  };
}
