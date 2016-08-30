import webpack from 'webpack'
import config from './webpack.config.js'
import express from 'express'
import http from 'http'
import path from 'path'

var app = express()

var compiler = webpack(config)

if (process.env.NODE_ENV !== 'production') {
  app.use(require('webpack-dev-middleware')(compiler, {
    noInfo: true,
    publicPath: config.output.publicPath
  }))

  app.use(require('webpack-hot-middleware')(compiler))
} else {
  app.use(
    '/public',
    express.static(path.join(__dirname, '/public'))
  )
}

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

app.get('/*', function (req, res) {
  res.type('text/html')
  res.status(200)
  res.sendFile(path.join(__dirname, '/public/index.html'))
})

app.set('port', 3000)

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ', app.get('port'))
})
