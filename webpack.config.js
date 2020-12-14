const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { GenerateSW: GenerateServiceWorker } = require('workbox-webpack-plugin');
const webpack = require('webpack');

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
          to: 'vendor/requirejs/[name].js',
        },
        {
          from: 'node_modules/react/dist/react.min.js',
          to: 'vendor/react/[name].js',
        },
      ],
    }),
    new HtmlWebpackPlugin({
      filename: 'everything.html',
      template: 'everything.dist.html',
    }),
    new GenerateServiceWorker({
      maximumFileSizeToCacheInBytes: 1000000000,
    }),
    new webpack.ProvidePlugin({
      process: ['process'],
    }),
  ],
  externals: {
    'canvas': 'commonjs canvas', // Required by noflo-image
  },
  resolve: {
    extensions: [".coffee", ".js"],
    fallback: {
      assert: false,
      child_process: false,
      constants: false,
      events: require.resolve('events/'),
      fs: false,
      os: false,
      path: require.resolve('path-browserify'),
      process: require.resolve('process'),
      util: require.resolve('util/'),
    },
  }
};
