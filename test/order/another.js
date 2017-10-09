var Transform = require('readable-stream').Transform

module.exports = function () {
  return Transform({
    transform (chunk, enc, cb) {
      this.push(chunk)
      cb()
    },
    flush (cb) {
      this.push('\npackage.json append')
      cb()
    }
  })
}
