const webpack = require('webpack')
const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')
const ExtReloader = require('@reorx/webpack-ext-reloader')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const { merge } = require('webpack-merge')

const rootDir = path.resolve(__dirname)
const srcDir = path.join(rootDir, 'src')
const destDir = path.join(rootDir, 'dist')

console.log('srcDir', srcDir)

const common = {
  entry: {
    popup: path.join(srcDir, 'popup.ts'),
    options: path.join(srcDir, 'options.ts'),
    background: path.join(srcDir, 'background.ts'),
    content_script: path.join(srcDir, 'content_script.ts'),
    custom_page: path.join(srcDir, 'custom_page.ts'),
  },
  output: {
    path: path.join(destDir, 'js'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        // options: {
        //   projectReferences: true,
        // }
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.scss$/i,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader',
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    plugins: [new TsconfigPathsPlugin()],
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: path.join(rootDir, 'public'), to: destDir }],
    }),
  ],
}


function developmentConfig() {
  console.log('development config')
  const config = merge(common, {
    // `eval` could not be used, see https://stackoverflow.com/questions/48047150/chrome-extension-compiled-by-webpack-throws-unsafe-eval-error
    devtool: 'cheap-module-source-map',
    mode: 'development',
    plugins: [
      new ExtReloader({
        entries: {
          background: 'background',
          contentScript: ['content_script'],
          extensionPage: ['custom_page'],
        },
      }),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      }),
    ],
  })

  if (process.env.MEASURE_SPEED) {
    const SpeedMeasurePlugin = require("speed-measure-webpack-plugin")
    const smp = new SpeedMeasurePlugin()
    config = smp.wrap(config)
  }
  return config
}


function productionConfig() {
  console.log('production config')
  const config = merge(common, {
    mode: 'production',
    plugins: [
      new webpack.DefinePlugin({
        'process.env.APP_ENV': JSON.stringify(process.env.APP_ENV),
      }),
    ],
  })
  return config
}


module.exports = process.env.NODE_ENV === 'production' ? productionConfig() : developmentConfig()
