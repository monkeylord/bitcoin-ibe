module.exports = {
  entry: __dirname + '/index.js',
  externals: {
    bsv: 'bsv'
  },
  output: {
    library: 'ibe',
    path: __dirname + '/',
    filename: 'ibe.js'
  }
}
