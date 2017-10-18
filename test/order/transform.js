var PassThrough = require('readable-stream').PassThrough

module.exports = function () {
  var ps = PassThrough()
  ps.push('package.json prepend\n')
  return ps
}
