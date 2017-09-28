var test = require('tape')
var path = require('path')
var documentify = require('../')
var concat = require('concat-stream')
var assertHtml = require('assert-html')
var dedent = require('dedent')

test('input', function (t) {
  t.test('uses input text if specified', function (t) {
    t.plan(10)
    var sourceHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>test</title>
      </head>
      <body>
        beep boop
      </body>
      </html>
    `.replace(/\n +/g, '')

    documentify(path.join(__dirname, 'test.html'), sourceHtml)
      .bundle()
      .pipe(concat({ encoding: 'string' }, function (html) {
        assertHtml(t, sourceHtml, html)
      }))
  })

  t.test('defaults to empty document', function (t) {
    t.plan(7)
    documentify(path.join(__dirname, 'test.html'))
      .bundle()
      .pipe(concat({ encoding: 'string' }, function (html) {
        assertHtml(t, `
          <!DOCTYPE html>
          <html>
            <head></head>
            <body></body>
          </html>
        `.replace(/\n +/g, ''), html)
      }))
  })

  t.test('reads html source file if it exists', function (t) {
    t.plan(14)
    var expected = dedent`
      <!DOCTYPE html>
      <html>
        <head>
          <title>input.html</title>
        </head>
        <body>
          <h1>some source from a file</h1>
        </body>
      </html>
    `.replace(/\n +/g, '')
    documentify(path.join(__dirname, 'input.html'))
      .bundle()
      .pipe(concat({ encoding: 'string' }, function (html) {
        assertHtml(t, expected, html.replace(/\n +/g, ''))
      }))
  })
})
