const { getTransport } = require('fbp-protocol-client');
const url = require('url');

module.exports = (address, timeout = 1000) => {
  const endpoint = url.parse(address);
  let protocol = null;
  switch (endpoint.protocol) {
    case 'ws:':
    case 'wss:':
      protocol = 'websocket';
      break;
    case 'webrtc:':
      protocol = 'webrtc';
      break;
    default:
      protocol = null;
  }

  const Runtime = getTransport(protocol);
  if (!Runtime) {
    return Promise.reject(new Error(`Protocol ${protocol} is not supported`));
  }

  return new Promise((resolve, reject) => {
    const runtime = new Runtime({
      protocol,
      address,
    });

    let onTimeout = null;
    let onError = null;
    let onCapabilities = null;
    onError = (e) => {
      if (timeout) clearTimeout(onTimeout);
      runtime.removeListener('capabilities', onCapabilities);
      if (runtime.isConnected()) runtime.disconnect();
      reject(e);
    };
    onCapabilities = (capabilities) => {
      if (timeout) clearTimeout(onTimeout);
      runtime.removeListener('error', onError);
      runtime.disconnect();
      resolve(capabilities);
    };
    onTimeout = setTimeout(() => {
      runtime.removeListener('capabilities', onCapabilities);
      runtime.removeListener('error', onError);
      if (runtime.isConnected()) runtime.disconnect();
      reject(new Error('Runtime connection timed out'));
    }, timeout);

    runtime.once('capabilities', onCapabilities);
    runtime.once('error', onError);
    runtime.connect();
  });
};
