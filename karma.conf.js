// Karma configuration

module.exports = config => {
  const options = {

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine', 'karma-typescript'],

    // list of plugins to use
    plugins: [
      require('karma-jasmine'),
      require('karma-typescript'),
      require('karma-spec-reporter'),
      require('karma-chrome-launcher')
    ],

    // list of files / patterns to load in the browser
    files: [
      { pattern: 'spec/**/*.ts' },
      { pattern: 'src/**/*.ts' }
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'spec/**/*.ts': ['karma-typescript'],
      'src/**/*.ts': ['karma-typescript']
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['spec', 'karma-typescript'],

    karmaTypescriptConfig: {
      tsconfig: 'tsconfig.json',
      compilerOptions: {
        module: 'commonjs'
      },
      reports: {
        html: {
          directory: "spec/coverage",
          subdirectory: "html-report"
        },
        'text-summary': null
      }
    },

    specReporter: {
      showSpecTiming: true, // print the time elapsed for each spec
      failFast: false       // test would finish with error when a first fail occurs.
    },

    browsers: ['ChromeHeadless'],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browsers should be started simultaneously
    concurrency: Infinity
  };

  config.set(options);
};
