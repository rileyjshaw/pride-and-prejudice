const path = require('path');

module.exports = {
  node: {
    fs: 'empty',
  },
  entry: {
    deconstruct: [path.resolve(__dirname, 'src/deconstruct.es6.js')],
    sort: ['babel-polyfill', path.resolve(__dirname, 'src/sort.es6.js')],
  },
  output: {
    path: __dirname,
    filename: '[name].js',
  },
  module: {
    loaders: [
      {
        test: /\.es6.js$/,
        include: [path.resolve(__dirname, 'src')],
        loader: 'babel',
        query: {
          plugins: ['transform-runtime', 'transform-object-rest-spread'],
          presets: ['es2015'],
        },
      },
    ],
  },
};
