fbp-protocol-healthcheck
========================

Tool for checking whether a [FBP protocol](https://flowbased.github.io/fbp-protocol/) runtime is available and responding. Performs the following actions:

* Connects to the runtime
* Requests runtime capabilities

## Command-line usage

The fbp-protocol-healthcheck tool can be used on the command-line:

```bash
$ fbp-protocol-healthcheck ws://localhost:3569
```

The tool will exit with code 1 if the runtime is not available. This makes the tool usable for example as a [Docker HEALTHCHECK command](https://docs.docker.com/compose/compose-file/#healthcheck):

```dockerfile
HEALTHCHECK --interval=5m --timeout=3s \
  CMD ./node_modules/.bin/fbp-protocol-healthcheck ws://127.0.0.1:3569
```

You can also use the command to wait for runtime availability in shell scripts like Travis builds:

```bash
until ./node_modules/.bin/fbp-protocol-healthcheck ws://localhost:3569 || (( count++ >= 10 )); do echo "Waiting for runtime to be ready"; sleep 10; done
```

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
