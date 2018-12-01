const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: './webpack.entry.js',
  output: {
    path: __dirname,
    filename: 'browser/everything.js',
  },
  plugins: [
    new UglifyJSPlugin()
  ],
  module: {
    rules: [
      {
        test: /noflo([\\]+|\/)lib([\\]+|\/)loader([\\]+|\/)register.js$/,
        use: [
          {
            loader: 'noflo-component-loader',
            options: {
              graph: null,
              debug: true,
              baseDir: __dirname,
              manifest: {
                runtimes: ['noflo'],
                discover: false,
                recursive: false,
              },
              runtimes: [
                'noflo',
                'noflo-browser'
              ],
            }
          }
        ]
      },
      {
        test: /noflo([\\]+|\/)lib([\\]+|\/)(.*)\.js$|noflo([\\]+|\/)components([\\]+|\/)(.*)\.js$|fbp-graph([\\]+|\/)lib([\\]+|\/)(.*)\.js$|noflo-runtime-([a-z]+)([\\]+|\/)(.*).js$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
            }
          }
        ]
      },
      {
        test: /\.coffee$/,
        use: [
          {
            loader: 'coffee-loader',
            options: {
              transpile: {
                presets: ['@babel/preset-env'],
              }
            }
          }
        ]
      },
      {
        test: /\.fbp$/,
        use: [
          {
            loader: 'fbp-loader',
          }
        ]
      },
    ]
  },
  externals: {
    'canvas': 'commonjs canvas', // Required by noflo-image
  },
  resolve: {
    extensions: [".coffee", ".js"],
  },
  node: {
    child_process: 'empty',
    fs: 'empty',
  },
};
