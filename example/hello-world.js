var fromString = require('from2-string')
var hyperstream = require('hyperstream')

/**
 * A basic example transform using `hyperstream`.
 */

module.exports = function () {
  var bodyStream = fromString('<h1>hello world</h1>')

  return hyperstream({
    body: {
      _appendHtml: bodyStream
    }
  })
}
