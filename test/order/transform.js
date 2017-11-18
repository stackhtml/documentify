var Transform = require('readable-stream').Transform

module.exports = function () {
  var first = true
  return Transform({
    transform (chunk, enc, cb) {
      if (first) this.push('package.json prepend\n')
      first = false
      this.push(chunk)
      cb(null)
    }
  })
}
