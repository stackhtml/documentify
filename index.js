var parallel = require('async-collection').parallel
var fromString = require('from2-string')
var stream = require('readable-stream')
var parse = require('fast-json-parse')
var EventEmitter = require('events')
var inherits = require('inherits')
var resolve = require('resolve')
var assert = require('assert')
var findup = require('findup')
var path = require('path')
var pump = require('pump')
var fs = require('fs')

module.exports = Documentify

var defaultHtml = '<!DOCTYPE html><html><head></head><body></body></html>'

function Documentify (entry, html, opts) {
  if (!(this instanceof Documentify)) return new Documentify(entry, html, opts)

  EventEmitter.call(this)

  assert.equal(typeof entry, 'string', 'documentify: entry should be type string')

  if (typeof html === 'object') {
    opts = html
    html = null
  }

  if (html) {
    assert.equal(typeof html, 'string', 'documentify: html should be type string')
  }

  opts = opts || {}

  this.html = html
  this.transforms = []
  this.entry = entry
  this.basedir = opts.basedir || process.cwd()
  this._ready = true

  if (opts.transform) {
    var self = this
    var transforms = opts.transform
    if (!Array.isArray(transforms)) {
      transforms = [transforms]
    }
    transforms.forEach(function (t) {
      if (Array.isArray(t)) {
        self.transform(t[0], t[1])
      } else {
        self.transform(t)
      }
    })
  }
}

inherits(Documentify, EventEmitter)

var placeholder = null
Documentify.prototype.transform = function (transform, opts) {
  var self = this
  opts = opts || {}
  if (typeof transform === 'string') {
    var index = this.transforms.length
    var basedir = opts.basedir || this.basedir
    this.transforms.push([ placeholder, opts ])
    this._ready = false
    resolve(transform, { basedir: basedir }, function (err, resolved) {
      if (err) {
        self.emit('error', err)
      }
      if (resolved) {
        self.transforms[index][0] = require(resolved)
      }
      if (self.transforms.every(function (tuple) { return tuple[0] !== placeholder })) {
        self.emit('_ready')
        self._ready = true
      }
    })
  } else {
    this.transforms.push([ transform, opts ])
  }

  return this
}

Documentify.prototype.bundle = function () {
  var pts = new stream.PassThrough()
  var self = this
  var source

  if (this._ready) {
    onready()
  } else {
    this.on('_ready', onready)
  }

  function onready () {
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
  }

  return pts

  function findTransforms (done) {
    var entry = path.join(path.dirname(self.entry), path.basename(self.entry))
    findup(entry, 'package.json', function (err, pathname) {
      // no package.json found - just run local transforms
      if (err) return done()

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

        loadTransforms(t, pathname, function (err, _transforms) {
          if (err) return done(err)
          self.transforms = self.transforms.concat(_transforms)
          done()
        })
      })
    })
  }

  function loadTransforms (transforms, basedir, done) {
    parallel(transforms.map(function (transform, index) {
      var name = transform
      var opts = {}
      if (Array.isArray(transform)) {
        name = transform[0]
        opts = transform[1]
      }

      return function (done) {
        resolve(name, { basedir: basedir }, function (err, resolved) {
          if (err) return done(err)
          done(null, [ require(resolved), opts ])
        })
      }
    }), done)
  }

  function createSource (done) {
    if (typeof self.html === 'string') {
      source = fromString(self.html)
      return done()
    }
    resolve(self.entry, { extensions: [ '.html' ] }, function (err, entry) {
      if (err) {
        source = fromString(defaultHtml)
      } else {
        source = fs.createReadStream(entry)
      }
      done()
    })
  }
}
