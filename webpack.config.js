const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { GenerateSW: GenerateServiceWorker } = require('workbox-webpack-plugin');

module.exports = {
  entry: {
    everything: './webpack.entry.js',
  },
  output: {
    path: path.resolve(__dirname, 'browser'),
    filename: '[name].js',
  },
  mode: 'production',
  devtool: 'source-map',
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
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'node_modules/requirejs/*.js',
          to: 'vendor/requirejs/',
          flatten: true,
        },
        {
          from: 'node_modules/react/dist/react.min.js',
          to: 'vendor/react/',
          flatten: true,
        },
      ],
    }),
    new GenerateServiceWorker(),
  ],
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
