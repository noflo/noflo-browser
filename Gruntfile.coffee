module.exports = ->
  # Project configuration
  pkg = @file.readJSON 'package.json'
  repo = pkg.repository.url.replace 'git://', 'https://'+process.env.GH_TOKEN+'@'

  @initConfig
    pkg: @file.readJSON 'package.json'

    noflo_browser:
      everything:
        options:
          debug: true
          webpack:
            externals:
              'repl': 'commonjs repl' # somewhere inside coffee-script
              'module': 'commonjs module' # somewhere inside coffee-script
              'child_process': 'commonjs child_process' # somewhere inside coffee-script
              'jison': 'commonjs jison'
              'URIjs': 'commonjs urijs'
              'canvas': 'commonjs canvas'
              'mimetype': 'commonjs mimetype'
              'should': 'commonjs should' # used by tests in octo
              'express': 'commonjs express' # used by tests in octo
              'highlight': 'commonjs highlight' # used by octo?
              'microflo-emscripten': 'commonjs microflo-emscripten' # optional?
              'acorn': 'commonjs acorn' # optional?
            module:
              loaders: [
                { test: /\.coffee$/, loader: "coffee-loader" }
                { test: /\.json$/, loader: "json-loader" }
                { test: /\.fbp$/, loader: "fbp-loader" }
              ]
            resolve:
              extensions: ["", ".coffee", ".js"]
            node:
              fs: "empty"
          heads: [
            """<style>
            body {
              padding: 0px;
              margin: 0px;
              color: #ffffff;
            }
            </style>"""
          ,
            """<script src="https://cdnjs.cloudflare.com/ajax/libs/coffee-script/1.7.1/coffee-script.min.js"></script>"""
          ,
            """
            <script src="vendor/requirejs/require.js"></script>
            <script>
            requirejs.config({
              packages: [
                {
                  name: 'React',
                  location: 'vendor/react',
                  main: 'react'
                }
              ]
            });
            </script>"""
          ]
        files:
          "browser/everything.js": ['package.json']

    copy:
      vendor:
        files: [
          expand: true
          cwd: 'node_modules/react/dist'
          src: '*.js'
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

    'gh-pages':
      options:
        base: 'browser'
        clone: 'gh-pages'
        message: 'Updating'
        repo: repo
        user:
          name: 'NoFlo bot'
          email: 'bot@noflo.org'
        silent: true
      src: '**/*'

  # Grunt plugins used for building
  @loadNpmTasks 'grunt-noflo-browser'
  @loadNpmTasks 'grunt-contrib-copy'
  @loadNpmTasks 'grunt-manifest'
  @loadNpmTasks 'grunt-string-replace'

  # Grunt plugins used for testing

  # Grunt plugins used for deploying
  @loadNpmTasks 'grunt-gh-pages'

  # Our local tasks
  @registerTask 'build', 'Build NoFlo for the chosen target platform', (target = 'all') =>
    @task.run 'noflo_browser'
    @task.run 'copy'
    @task.run 'manifest'
    @task.run 'string-replace:manifest'

  @registerTask 'test', 'Build NoFlo and run automated tests', (target = 'all') =>
    @task.run 'build'

  @registerTask 'default', ['test']
