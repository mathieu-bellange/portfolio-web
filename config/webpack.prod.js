const helpers = require('./helpers');
const webpackMerge = require('webpack-merge'); // used to merge webpack configs
const commonConfig = require('./webpack.common.js'); // the settings that are common to prod and dev

/**
 * Webpack Plugins
 */
const HtmlWebpackPlugin = require('html-webpack-plugin');
const DefinePlugin = require('webpack/lib/DefinePlugin');
const ModuleConcatenationPlugin = require('webpack/lib/optimize/ModuleConcatenationPlugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const WebpackMd5Hash = require('webpack-md5-hash');
const CompressionPlugin = require('compression-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");


/**
 * Webpack Constants
 */
const ENV = process.env.NODE_ENV = process.env.ENV = 'production';
const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 8080;
const METADATA = {
  host: HOST,
  port: PORT,
  ENV
};

module.exports = webpackMerge(commonConfig, {

  /**
   * Developer tool to enhance debugging
   *
   * See: http://webpack.github.io/docs/configuration.html#devtool
   * See: https://github.com/webpack/docs/wiki/build-performance#sourcemaps
   */
  devtool: 'source-map',

  /**
   * Options affecting the output of the compilation.
   *
   * See: http://webpack.github.io/docs/configuration.html#output
   */
  output: {

    /**
     * The output directory as absolute path (required).
     *
     * See: http://webpack.github.io/docs/configuration.html#output-path
     */
    path: helpers.root('dist'),

    publicPath: '/',

    /**
     * Specifies the name of each output file on disk.
     * IMPORTANT: You must not specify an absolute path here!
     *
     * See: http://webpack.github.io/docs/configuration.html#output-filename
     */
    filename: '[name].[chunkhash].bundle.js',

    /**
     * The filename of the SourceMaps for the JavaScript files.
     * They are inside the output.path directory.
     *
     * See: http://webpack.github.io/docs/configuration.html#output-sourcemapfilename
     */
    sourceMapFilename: '[name].[chunkhash].bundle.map',

    /**
     * The filename of non-entry chunks as relative path
     * inside the output.path directory.
     *
     * See: http://webpack.github.io/docs/configuration.html#output-chunkfilename
     */
    chunkFilename: '[id].[chunkhash].chunk.js'

  },

  /**
   * Add additional plugins to the compiler.
   *
   * See: http://webpack.github.io/docs/configuration.html#plugins
   */
  plugins: [
    new ModuleConcatenationPlugin(),
    new CopyWebpackPlugin([
      { from: './public' }
    ]),
    new HtmlWebpackPlugin({
      template: 'client/index.html',
      chunksSortMode: 'dependency',
      metadata: METADATA
    }),
    new DefinePlugin({
      ENV: JSON.stringify(METADATA.ENV),
      'process.env': {
        ENV: JSON.stringify(METADATA.ENV),
        NODE_ENV: JSON.stringify(METADATA.ENV)
      }
    }),

    /**
     * Plugin: WebpackMd5Hash
     * Description: Plugin to replace a standard webpack chunkhash with md5.
     *
     * See: https://www.npmjs.com/package/webpack-md5-hash
     */
    new WebpackMd5Hash(),

    /**
     * Plugin: UglifyJsPlugin
     * Description: Minimize all JavaScript output of chunks.
     * Loaders are switched into minimizing mode.
     *
     * See: https://webpack.github.io/docs/list-of-plugins.html#uglifyjsplugin
     */
    // NOTE: To debug prod builds uncomment //debug lines and comment //prod lines
    new UglifyJsPlugin({
      uglifyOptions: {
        // beautify: true, //debug
        // mangle: false, //debug
        // dead_code: false, //debug
        // unused: false, //debug
        // deadCode: false, //debug
        // compress: {
        //   ie8: false,
        //   keep_fnames: true,
        //   drop_debugger: false,
        //   dead_code: false,
        //   unused: false
        // }, // debug
        // comments: true, //debug


        beautify: false, // prod
        output: {
          comments: false
        }, // prod
        mangle: {
          ie8: false
        }, // prod
        compress: {
          ie8: false,
          warnings: false,
          conditionals: true,
          unused: true,
          comparisons: true,
          sequences: true,
          dead_code: true,
          evaluate: true,
          if_return: true,
          join_vars: true,
          negate_iife: false // we need this for lazy v8
        }
      }
    }),

    /**
     * Plugin: CompressionPlugin
     * Description: Prepares compressed versions of assets to serve
     * them with Content-Encoding
     *
     * See: https://github.com/webpack/compression-webpack-plugin
     */
    new CompressionPlugin({
      regExp: /\.css$|\.html$|\.js$|\.map$/,
      threshold: 2 * 1024
    }),
    new OptimizeCSSAssetsPlugin({})
  ],

  /**
   * Include polyfills or mocks for various node stuff
   * Description: Node configuration
   *
   * See: https://webpack.github.io/docs/configuration.html#node
   */
  node: {
    global: true,
    crypto: 'empty',
    process: false,
    module: false,
    clearImmediate: false,
    setImmediate: false
  },

  mode: 'production'
});
