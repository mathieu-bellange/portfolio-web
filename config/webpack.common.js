/**
 * @author: mbellange
 */
const helpers = require('./helpers');
const devMode = process.env.NODE_ENV !== 'production'

/**
 * Webpack Plugins
 */
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin');

/**
 * Webpack configuration
 *
 * See: http://webpack.github.io/docs/configuration.html#cli
 */
// NOTE refacto pour passer tous les fichiers en .sss
module.exports = {

  entry: {
    main: './client/app'
  },

  resolve: {
    extensions: ['.js', '.css'],
    modules: [helpers.root('client'), helpers.root('public'), helpers.root('node_modules')]
  },

  module: {

    rules: [

      {
        test: /\.js$/,
        exclude: [/node_modules/, /config/, /server/, /public/],
        use: 'babel-loader'
      },

      {
        test: /\.css$/,
        exclude: [/@fortawesome/],
        use: [
          devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader'
        ]
      },

      {
        test: /\.css$/,
        include: [/@fortawesome/],
        use: [
          devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              alias: {
                '../fonts': 'font-awesome/fonts',
                './images': 'images'
              }
            }
          }
        ]
      },

      {
        test: /\.(woff(2)?|ttf|eot|png|jpg|jpeg|gif|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 10000
          }
        }]
      }
    ]

  },

  plugins: [
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: devMode ? '[name].css' : '[name].[hash].css',
      chunkFilename: devMode ? '[id].css' : '[id].[hash].css'
    }),
    new CleanWebpackPlugin('../dist', { allowExternal: true })
  ],

  node: {
    global: true,
    crypto: 'empty',
    module: false,
    clearImmediate: false,
    setImmediate: false
  }

};
