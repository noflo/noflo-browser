module.exports = ->
  # Project configuration
  pkg = @file.readJSON 'package.json'
  repo = pkg.repository.url.replace 'git://', 'https://'+process.env.GH_TOKEN+'@'

  @initConfig
    pkg: @file.readJSON 'package.json'

    # Updating the package manifest files
    noflo_manifest:
      update:
        files:
          'component.json': ['graphs/*', 'components/*']
          'package.json': ['graphs/*', 'components/*']

    # Browser build of NoFlo
    'bower-install-simple':
      deps:
        options:
          interactive: false
          forceLatest: false
          directory: 'browser/bower_components'

    noflo_browser:
      everything:
        options:
          debug: true
          heads: [
            """<style>
            body {
              padding: 0px;
              margin: 0px;
              color: #ffffff;
            }
            </style>"""
          ,
            """<script>
            requirejs.config({
              packages: [
                {
                  name: 'React',
                  location: './bower_components/react',
                  main: 'react'
                }
              ]
            });
            </script>"""
          ]
        files:
          "browser/everything.js": ['component.json']

    manifest:
      cache:
        options:
          basePath: 'browser'
          timestamp: yes
          verbose: no
        dest: 'browser/manifest.appcache'
        src: [
          'everything.*'
          'bower_components/*/*'
        ]

    'string-replace':
      manifest:
        files:
          './browser/everything.html': './browser/everything.html'
        options:
          replacements: [
            pattern: '<html>'
            replacement: '<html manifest="/noflo-browser/manifest.appcache">'
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
  @loadNpmTasks 'grunt-bower-install-simple'
  @loadNpmTasks 'grunt-noflo-manifest'
  @loadNpmTasks 'grunt-noflo-browser'
  @loadNpmTasks 'grunt-manifest'
  @loadNpmTasks 'grunt-string-replace'

  # Grunt plugins used for testing

  # Grunt plugins used for deploying
  @loadNpmTasks 'grunt-gh-pages'

  # Our local tasks
  @registerTask 'build', 'Build NoFlo for the chosen target platform', (target = 'all') =>
    @task.run 'bower-install-simple'
    @task.run 'noflo_manifest'
    @task.run 'noflo_browser'
    @task.run 'manifest'
    @task.run 'string-replace:manifest'

  @registerTask 'test', 'Build NoFlo and run automated tests', (target = 'all') =>
    @task.run 'build'

  @registerTask 'default', ['test']
