var parallel = require('async-collection').parallel
var fromString = require('from2-string')
var stream = require('readable-stream')
var parse = require('fast-json-parse')
var findup = require('findup')
var path = require('path')
var pump = require('pump')
var fs = require('fs')

module.exports = Documentify

function Documentify (entry, opts) {
  if (!(this instanceof Documentify)) return new Documentify(entry, opts)

  opts = opts || {}

  this.defaultHtml = '<html><head></head><body></body></html>'
  this.transforms = []
  this.entry = entry

  if (opts.transform) {
    if (Array.isArray(opts.transform)) this.transforms.concat(opts.transform)
    else this.transforms.push(opts.transform)
  }
}

Documentify.prototype.transform = function (transform, opts) {
  this.transforms.push([ transform, opts ])
}

Documentify.prototype.bundle = function () {
  var pts = new stream.PassThrough()
  var self = this
  var source

  var tasks = [
    findTransforms,
    createSource
  ]
  parallel(tasks, function (err) {
    if (err) return pts.emit('error', err)
    var args = self.transforms.reduce(function (arr, tuple) {
      var fn = tuple[0]
      var opts = tuple[1] || {}
      var transform = fn(opts)
      arr.push(transform)
      return arr
    }, [source])

    args.push(pts)
    pump.apply(pump, args)
  })

  return pts

  function findTransforms (done) {
    var entry = path.join(path.dirname(self.entry), path.basename(self.entry))
    findup(entry, 'package.json', function (err, pathname) {
      if (err) return done(err)
      var filename = path.join(pathname, 'package.json')
      fs.readFile(filename, function (err, file) {
        if (err) return done(err)
        var parsed = parse(file)
        if (parsed.err) return done(parsed.err)
        var json = parsed.value
        var d = json.documentify
        if (!d) return done()
        var t = d.transform
        if (!t || !Array.isArray(t)) return done()
        var _transforms = t.map(function (transform) {
          return Array.isArray(transform) ? transform : [ transform ]
        })
        self.transforms.concat(_transforms)
        done()
      })
    })
  }

  function createSource (done) {
    var entry = self.entry
    if (path.extname(entry) !== '.html') {
      source = fromString(self.defaultHtml)
      done()
    } else {
      source = fs.createReadStream(entry)
      done()
    }
  }
}
