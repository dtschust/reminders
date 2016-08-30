var webpack = require('webpack')
var path = require('path')
var autoprefixer = require('autoprefixer')
var LessPluginNpmImport = require('less-plugin-npm-import')

var config = {
  devtool: 'eval',
  entry: [
    'babel-polyfill',
    'webpack-hot-middleware/client',
    path.join(__dirname, '/src/index.jsx')
  ],
  output: {
    path: path.join(__dirname, '/public'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV)
        // ENV_URL: JSON.stringify(process.env.ENV_URL)
      }
    }),
    // If any env variable still remain, ensure they evaluate to `undefined`.
    new webpack.DefinePlugin({
      'process.env': {
      }
    }),
    new webpack.NoErrorsPlugin()
  ],
  module: {
    loaders: [
      {
        test: /\.jsx?/,
        loader: 'babel',
        exclude: /node_modules/,
        query: {
          'env': {
            'development': {
              'plugins': [['react-transform', {
                'transforms': [{
                  'transform': 'react-transform-hmr',
                  'imports': ['react'],
                  'locals': ['module']
                }]
              }]]
            }
          }
        }
      },
      {
        test: /\.less$/,
        loader: 'style!css!postcss!less'
      },
      {
        test: /\.css$/,
        loader: 'style!css!postcss'
      },
      {
        test: /\.json$/,
        loader: 'json'
      }
    ]
  },
  postcss: function () {
    return [autoprefixer]
  },
  lessLoader: {
    lessPlugins: [new LessPluginNpmImport()]
  },
  resolve: {
    extensions: ['', '.jsx', '.js', '.json', '.less']
  },
  devServer: {
    port: 3000,
    contentBase: path.join(__dirname, '/public')
  }
}

if (process.env.NODE_ENV === 'production') {
  // remove live reload stuff
  config.entry = [
    'babel-polyfill',
    path.join(__dirname, '/src/index.jsx')
  ]
  config.plugins = config.plugins.slice(1)
}

module.exports = config
