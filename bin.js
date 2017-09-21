#!/usr/bin/env node

var ansi = require('ansi-escape-sequences')
var minimist = require('minimist')
var path = require('path')
var pump = require('pump')

var Documentify = require('./')

var USAGE = `
  $ ${clr('documentify', 'bold')} ${clr('[entry-file]', 'green')} [options]

  Options:

    -h, --help        print usage
    -v, --version     print version
    -t, --transform   add a transform

  Examples:

    Start bundling HTML
    ${clr('$ documentify .', 'cyan')}

  Running into trouble? Feel free to file an issue:
  ${clr('https://github.com/stackhtml/documentify/issues/new', 'cyan')}

  Do you enjoy using this software? Become a backer:
  ${clr('https://opencollective.com/choo', 'cyan')}
`.replace(/\n$/, '').replace(/^\n/, '')

var argv = minimist(process.argv.slice(2), {
  alias: {
    help: 'h',
    version: 'v',
    transform: 't'
  },
  boolean: [
    'help',
    'version'
  ],
  array: [
    'transform'
  ]
})

;(function main (argv) {
  var entry = argv._[0]

  // If entry isn't an absolute path, convert to absolute path
  if (!entry) entry = process.cwd()
  if (!/^\//.test(entry)) entry = path.join(process.cwd(), entry)

  if (argv.help) {
    console.log(USAGE)
  } else if (argv.version) {
    console.log(require('./package.json').version)
  } else {
    var bundler = Documentify(entry, {
      transform: argv.transform
    })
    pump(bundler.bundle(), process.stdout, function (err) {
      if (err) {
        console.error(err)
        process.exit(1)
      }
    })
  }
})(argv)

function clr (text, color) {
  return process.stdout.isTTY ? ansi.format(text, color) : text
}
