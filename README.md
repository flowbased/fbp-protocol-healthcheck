fbp-protocol-healthcheck [![Build Status](https://travis-ci.org/flowbased/fbp-protocol-healthcheck.svg?branch=master)](https://travis-ci.org/flowbased/fbp-protocol-healthcheck)
========================

Tool for checking whether a [FBP protocol](https://flowbased.github.io/fbp-protocol/) runtime is available and responding. Performs the following actions:

* Connects to the runtime
* Requests runtime capabilities

## Command-line usage

The fbp-protocol-healthcheck tool can be used on the command-line:

```bash
$ fbp-protocol-healthcheck ws://localhost:3569
```

The tool will exit with code 1 if the runtime is not available. This makes the tool usable for example as a [Docker HEALTHCHECK command](https://docs.docker.com/compose/compose-file/#healthcheck).

## Programmatic usage

Install this library, and then:

```javascript
const healthcheck = require('fbp-protocol-healthcheck');

healthcheck('ws://localhost:3569')
  .then(() => {
    console.log('Runtime is available');
  })
  .catch((e) => {
    console.log(`Runtime not available: ${e.message}`);
  });
```
