#!/usr/bin/env node
var ghpages = require('gh-pages')
var path = require('path')

ghpages.publish(path.join(__dirname, '../public'), function (err) {
  if (err) {
    console.log('Error publishing to gh-pages:', err)
  }
})
