# parcom.ts

[![GitHub Action](https://img.shields.io/github/actions/workflow/status/raviqqe/parcom.ts/test.yaml?branch=main&style=flat-square)](https://github.com/raviqqe/parcom.ts/actions)
[![Codecov](https://img.shields.io/codecov/c/github/raviqqe/parcom.ts.svg?style=flat-square)](https://codecov.io/gh/raviqqe/parcom.ts)
[![npm](https://img.shields.io/npm/v/@raviqqe/parcom?style=flat-square)](https://www.npmjs.com/package/@raviqqe/parcom)
[![License](https://img.shields.io/github/license/raviqqe/parcom.ts.svg?style=flat-square)](LICENSE)

Parser combinator for nontrivial tokens in TypeScript.

Currently, this package supports only content-free grammars.
But you can easily extend it by forking it and modifying `TokenIterator` to handle generic states.

## Features

- Support for nontrivial tokens
  - Lines in line-oriented configuration file formats, HTML nodes, etc.

## License

[MIT](LICENSE)
