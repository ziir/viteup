# viteup [![npm](https://img.shields.io/npm/v/viteup)](https://www.npmjs.com/package/viteup)

## Disclaimer

This software is **experimental**.

## Description

A better (opinionated) way to compile your TypeScript libraries, powered by [Vite](https://vitejs.dev) + [SWC](https://swc.rs).

- Output format(s) & directory derived from **package.json exports** & other _package.json fields_.
- **SWC** compiler integration with [vite-plugin-swc-transform](https://github.com/ziir/vite-plugin-swc-transform) by default
- Zero-to-minimal configuration required, freedom to override

## Installation

```sh
npm i --save-dev viteup
```

_Note:_ if you plan on using a different compiler than SWC, you can avoid installing the `vite-plugin-swc-transform` dependency:

```sh
npm i --save-dev --no-optional viteup
```

## Example Usage

- Add a package.json `exports` or output field to your `package.json` file
- Add a "build" script to your `package.json` file

```json
{
  "name": "my-library",
  "type": "module",
  "exports": "./dist/index.js",
  "scripts": {
    "build": "viteup"
  }
}
```

### Build.

```
npm run build
```

## Advanced Usage

### Examples of `package.json` setup for ESM or CommonJS, or both

#### CommonJS output only for maximum compatibility

```json
{
  "name": "my-library",
  "type": "commonjs",
  "main": "./dist/index.js",
  "scripts": {
    "build": "viteup"
  }
}
```

#### CommonJS output only for "modern module resolution"-capable consumers

```json
{
  "name": "my-library",
  "type": "commonjs",
  "exports": "./dist/index.js",
  "scripts": {
    "build": "viteup"
  }
}
```

#### ESM output only for broad compatibility

```json
{
  "name": "my-library",
  "module": "./dist/index.mjs",
  "scripts": {
    "build": "viteup"
  }
}
```

#### ESM output only for "modern module resolution"-capable consumers

```json
{
  "name": "my-library",
  "type": "module",
  "exports": "./dist/index.js",
  "scripts": {
    "build": "viteup"
  }
}
```

#### Dual emit CommonJS + ESM output for "modern module resolution"-capable consumers

```json
{
  "name": "my-library",
  "type": "module",
  "exports": {
    "require": "./dist/index.cjs",
    "default": "./dist/index.js"
  },
  "scripts": {
    "build": "viteup"
  }
}
```

#### Dual emit CommonJS + ESM output for maximum compatibility

```json
{
  "name": "my-library",
  "type": "commonjs",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "exports": {
    "require": "./dist/index.js",
    "default": "./dist/index.mjs"
  },
  "scripts": {
    "build": "viteup"
  }
}
```

### Extending or overriding Vite configuration

- _FIXME_

### JavaScript API

- _FIXME_

### Integration with Vitest

- _FIXME_

## Support

### Package.json output fields support

- _FIXME_

### Package.json export conditions support

- _FIXME_
