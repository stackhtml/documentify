var Transform = require('readable-stream').Transform

module.exports = function () {
  return new Transform({
    write: function (chunk, enc, cb) {
      cb()
    },
    flush: function (cb) {
      this.push('transform from package.json')
      this.push(null)
      cb()
    }
  })
}
