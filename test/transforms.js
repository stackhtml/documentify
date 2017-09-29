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
})

function append (text) {
  return new Transform({
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
