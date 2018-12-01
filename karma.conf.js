module.exports = function(config) {
  const files = [
    {
      pattern: 'browser/everything.html',
      included: false,
      served: true,
    },
    {
      pattern: 'browser/everything.js',
      included: true,
      served: true,
    },
    {
      pattern: 'spec/fixtures/*.json',
      included: false,
      served: true,
    },
    {
      pattern: 'browser/vendor/requirejs/*.js',
      included: false,
      served: true,
    },
    {
      pattern: 'browser/vendor/react/*.js',
      included: false,
      served: true,
    },
    {
      pattern: 'browser/manifest.appcache',
      included: false,
      served: true,
    },
    'spec/*.js',
  ];

  const configuration = {
    basePath: '',
    frameworks: ['mocha', 'chai'],
    files,
    exclude: [],
    preprocessors: {},
    reporters: ['mocha'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['Chrome', 'ChromeHeadless', 'ChromeHeadlessNoSandbox'],
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox'],
      },
    },
    singleRun: true,
    concurrency: Infinity
  };

  config.set(configuration);
}
