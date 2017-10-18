var test = require('tape')
var path = require('path')
var Transform = require('readable-stream').Transform
var PassThrough = require('readable-stream').PassThrough
var concat = require('concat-stream')
var documentify = require('../')

test('transforms', function (t) {
  var testPath = path.join(__dirname, 'test.html')
  t.test('should pipe transforms in order', function (t) {
    t.plan(2)

    function t1 () {
      return append('transform1')
    }
    function t2 () {
      return append('transform2')
    }

    documentify(testPath)
      .transform(t1)
      .transform(t2)
      .bundle()
      .pipe(concat({ encoding: 'string' }, function (result) {
        var lines = result.split(/\n/g)
        t.equal(lines.pop(), 'transform2')
        t.equal(lines.pop(), 'transform1')
      }))
  })

  t.test('should find transforms in package.json', function (t) {
    t.plan(1)

    documentify(path.join(__dirname, 'transforms/'))
      .bundle()
      .pipe(concat({ encoding: 'string' }, function (result) {
        t.equal(result, 'transform from package.json')
      }))
  })

  t.test('should apply package.json transforms before programmatically configured transforms', function (t) {
    t.plan(4)

    documentify(path.join(__dirname, 'order/'))
      .transform(function () { return append('.transform append') })
      .transform(function () { return prepend('.transform prepend') })
      .bundle()
      .pipe(concat({ encoding: 'string' }, function (result) {
        var lines = result.split(/\n/g)
        t.equal(lines.shift(), '.transform prepend')
        t.equal(lines.shift(), 'package.json prepend')
        t.equal(lines.pop(), '.transform append')
        t.equal(lines.pop(), 'package.json append')
      }))
  })
})

function prepend (text) {
  var ps = PassThrough()
  ps.push(text + '\n')
  return ps
}
function append (text) {
  return Transform({
    write (chunk, enc, cb) {
      this.push(chunk)
      cb()
    },
    flush (cb) {
      this.push('\n' + text)
      cb()
    }
  })
}
