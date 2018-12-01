module.exports = ->
  # Project configuration
  pkg = @file.readJSON 'package.json'
  repo = pkg.repository.url.replace 'git://', 'https://'+process.env.GH_TOKEN+'@'

  @initConfig
    pkg: @file.readJSON 'package.json'

    webpack:
      build: require './webpack.config.js'

    copy:
      vendor:
        files: [
          expand: true
          cwd: 'node_modules/react/dist'
          src: 'react.min.js'
          dest: 'browser/vendor/react'
          filter: 'isFile'
        ,
          expand: true
          cwd: 'node_modules/requirejs'
          src: '*.js'
          dest: 'browser/vendor/requirejs'
          filter: 'isFile'
        ]

    manifest:
      cache:
        options:
          basePath: 'browser'
          timestamp: yes
          verbose: no
        dest: 'browser/manifest.appcache'
        src: [
          'everything.*'
          'vendor/*/**.js'
        ]

    'string-replace':
      manifest:
        files:
          './browser/everything.html': './browser/everything.html'
        options:
          replacements: [
            pattern: '<html>'
            replacement: '<html manifest="manifest.appcache">'
          ]

  # Grunt plugins used for building
  @loadNpmTasks 'grunt-webpack'
  @loadNpmTasks 'grunt-contrib-copy'
  @loadNpmTasks 'grunt-manifest'
  @loadNpmTasks 'grunt-string-replace'

  # Our local tasks
  @registerTask 'build', 'Build NoFlo for the chosen target platform', (target = 'all') =>
    @task.run 'webpack'
    @task.run 'copy'
    @task.run 'manifest'
    @task.run 'string-replace:manifest'

  @registerTask 'default', ['test']
