module.exports = ->
  # Project configuration
  pkg = @file.readJSON 'package.json'
  repo = pkg.repository.url.replace 'git://', 'https://'+process.env.GH_TOKEN+'@'

  @initConfig
    pkg: @file.readJSON 'package.json'

    noflo_browser:
      everything:
        options:
          exposed_modules:
            'noflo': 'noflo'
            'noflo-runtime-postmessage': 'noflo-runtime-postmessage'
            'fbp-protocol-client': 'fbp-protocol-client'
            'noflo-runtime': 'noflo-runtime'
          manifest:
            runtimes: [
              'noflo'
            ]
            discover: true
            recursive: true
            subdirs: false
          debug: true
          webpack:
            externals:
              'repl': 'commonjs repl' # somewhere inside coffee-script
              'module': 'commonjs module' # somewhere inside coffee-script
              'child_process': 'commonjs child_process' # somewhere inside coffee-script
              'jison': 'commonjs jison'
              'canvas': 'commonjs canvas'
              'microflo': 'commonjs microflo'
              'react': 'amd react'
              'mimetype': 'commonjs mimetype'
              'should': 'commonjs should' # used by tests in octo
              'express': 'commonjs express' # used by tests in octo
              'highlight': 'commonjs highlight' # used by octo?
              'microflo-emscripten': 'commonjs microflo-emscripten' # optional?
              'acorn': 'commonjs acorn' # optional?
            module:
              rules: [
                test: /\.coffee$/
                use: ["coffee-loader"]
              ,
                test: /\.fbp$/
                use: ["fbp-loader"]
              ]
            resolve:
              extensions: [".coffee", ".js"]
              alias:
                URIjs: 'urijs'
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
                  main: 'react.min'
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

    # CoffeeScript compilation
    coffee:
      spec:
        options:
          bare: true
        expand: true
        cwd: 'spec'
        src: ['**.coffee']
        dest: 'spec'
        ext: '.js'
    # Web server for the browser tests
    connect:
      server:
        options:
          port: 8000
    # BDD tests on browser
    noflo_browser_mocha:
      all:
        options:
          scripts: ["../browser/everything.js"]
        files:
          'spec/runner.html': ['spec/*.js']
    mocha_phantomjs:
      all:
        options:
          output: 'spec/result.xml'
          reporter: 'spec'
          urls: ['http://localhost:8000/spec/runner.html']
          failWithOutput: true
    'gh-pages':
      options:
        base: 'browser'
        clone: 'gh-pages'
        message: "Release #{pkg.name} #{process.env.TRAVIS_TAG}"
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
  @loadNpmTasks 'grunt-contrib-coffee'
  @loadNpmTasks 'grunt-contrib-connect'
  @loadNpmTasks 'grunt-mocha-phantomjs'

  # Grunt plugins used for deploying
  @loadNpmTasks 'grunt-gh-pages'

  grunt = @
  @registerTask 'checkSize', ->
    limit = 5000
    done = @async()
    require('child_process').exec 'du -k --total browser/*', (err, stdout) ->
      grunt.fail.fatal err if err
      lines = stdout.split "\n"
      entries = {}
      for line in lines
        continue unless line.length
        [kb, entry] = line.split "\t"
        entries[entry] = parseInt kb
      if entries.total < limit
        grunt.log.writeln "Total size for build is #{entries.total}kb, below #{limit}kb max"
        return done()
      for entry, size of entries
        continue if entry is 'total'
        grunt.log.writeln "Size of #{entry} is #{size}kb"
      grunt.fail.warn new Error "Total size for build is #{entries.total}kb (>#{limit}kb)"

  # Our local tasks
  @registerTask 'build', 'Build NoFlo for the chosen target platform', (target = 'all') =>
    @task.run 'noflo_browser'
    @task.run 'copy'
    @task.run 'manifest'
    @task.run 'string-replace:manifest'

  @registerTask 'test', 'Build NoFlo and run automated tests', (target = 'all') =>
    @task.run 'build'
    @task.run 'coffee'
    @task.run 'connect'
    @task.run 'noflo_browser_mocha'
    @task.run 'mocha_phantomjs'
    @task.run 'checkSize'

  @registerTask 'default', ['test']
