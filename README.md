# documentify [![stability][0]][1]
[![npm version][2]][3] [![build status][4]][5]
[![downloads][8]][9] [![js-standard-style][10]][11]

Modular HTML bundler.

## Usage
```txt
  $ documentify [entry-file] [options]

  Options:

    -h, --help        print usage
    -v, --version     print version

  Examples:

    Start bundling HTML
    $ documentify .

    Bundle HTML from a stream
    $ cat index.html | documentify

  Running into trouble? Feel free to file an issue:
  https://github.com/stackhtml/documentify/issues/new

  Do you enjoy using this software? Become a backer:
  https://opencollective.com/choo
```

## Configuring transforms
### Command Line
```sh
$ documentify ./index.html -t my-transform -t another-transform
```

### package.json
```json
{
  "name": "my-app",
  "version": "1.0.0",
  "private": true,
  "documentify": {
    "transform": [
      "my-transform",
      "another-transform"
    ]
  }
}
```

## Writing transforms
A transform is a regular function that returns a `through` stream. The
`through` stream can modify the HTML stream, which in turn passes data to the
next stream. Together the streams form a pipeline.

```js
var through = require('through2')

module.exports = transform

function transform (opts) {
  return through()
}
```

## API
### `document = documentify(entry, [html], [opts])`
Create a new documentify instance. If `entry` is a `.html` file, it'll be
used as the source. If `entry` is falsy and `html` is a string or readable
stream, that will be used as the input instead. Otherwise if `entry` is falsy
and `html` is omitted, an empty HTML file with just a body and head will be
used as the source.

### `document.transform(fn, [opts])`
Pass a transform to the document instance

### `readableStream = document.bundle()`
Create a new readable stream, and start flowing the html through the
transforms.

## See Also
- [substack/hyperstream](https://github.com/substack/hyperstream)
- [choojs/bankai](https://github.com/choojs/bankai)

## License
[MIT](https://tldrlegal.com/license/mit-license)

[0]: https://img.shields.io/badge/stability-experimental-orange.svg?style=flat-square
[1]: https://nodejs.org/api/documentation.html#documentation_stability_index
[2]: https://img.shields.io/npm/v/documentify.svg?style=flat-square
[3]: https://npmjs.org/package/documentify
[4]: https://img.shields.io/travis/stackhtml/documentify/master.svg?style=flat-square
[5]: https://travis-ci.org/stackhtml/documentify
[6]: https://img.shields.io/codecov/c/github/stackhtml/documentify/master.svg?style=flat-square
[7]: https://codecov.io/github/stackhtml/documentify
[8]: http://img.shields.io/npm/dm/documentify.svg?style=flat-square
[9]: https://npmjs.org/package/documentify
[10]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square
[11]: https://github.com/feross/standard
