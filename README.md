# parsdown.ts

[![GitHub Action](https://img.shields.io/github/actions/workflow/status/raviqqe/parsdown.ts/test.yaml?branch=main&style=flat-square)](https://github.com/raviqqe/parsdown.ts/actions)
[![Codecov](https://img.shields.io/codecov/c/github/raviqqe/parsdown.ts.svg?style=flat-square)](https://codecov.io/gh/raviqqe/parsdown.ts)
[![npm](https://img.shields.io/npm/v/@raviqqe/parsdown?style=flat-square)](https://www.npmjs.com/package/@raviqqe/parsdown)
[![License](https://img.shields.io/github/license/raviqqe/parsdown.ts.svg?style=flat-square)](LICENSE)

A parser combinator library for nontrivial tokens written in TypeScript.

## Features

- Support for any tokens
  - Lines in line-oriented configuration file formats, HTML nodes, etc.
- A simple set of combinators
- Strict typing

Currently, this package supports only content-free grammars.
But you can easily extend it by forking it and modifying `TokenIterator` to handle generic states.

## License

[MIT](LICENSE)
