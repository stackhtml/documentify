var test = require('tape')
var path = require('path')
var Transform = require('readable-stream').Transform
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
        t.equal(lines[0], '.transform prepend')
        t.equal(lines[1], 'package.json prepend')
        t.equal(lines[lines.length - 2], 'package.json append')
        t.equal(lines[lines.length - 1], '.transform append')
      }))
  })

  t.test('should accept primitives as option value', function (t) {
    t.plan(1)

    documentify(testPath)
      .transform(function (opt) { return append(opt) }, 'whatever')
      .bundle()
      .pipe(concat({ encoding: 'string' }, function (result) {
        var lines = result.split(/\n/g)
        t.equal(lines[lines.length - 1], 'whatever')
      }))
  })
})

function prepend (text) {
  var first = true
  return Transform({
    write (chunk, enc, cb) {
      if (first) this.push(text + '\n')
      first = false
      this.push(chunk)
      cb()
    }
  })
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
