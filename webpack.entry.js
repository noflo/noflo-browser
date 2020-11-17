var exported = {
  noflo: require('noflo'),
  'noflo-assembly': require('noflo-assembly'),
};

window.require = (moduleName) => {
  if (exported[moduleName]) {
    return exported[moduleName];
  }
  throw new Error('Module ' + moduleName + ' not available');
};

function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
  var results = regex.exec(location.search);
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

const runtimeOptions = {
  baseDir: 'browser',
  defaultPermissions: [
    'protocol:graph',
    'protocol:component',
    'protocol:network',
    'protocol:runtime',
    'component:getsource',
    'component:setsource'
  ]
};

const queryProtocol = getParameterByName('fbp_protocol') || 'opener';
let rt = null;
var postMessageRuntime = require('noflo-runtime-postmessage');
if (queryProtocol == 'opener') {
  const ide = 'https://app.flowhub.io';
  const debugUrl = `${ide}#runtime/endpoint?${encodeURIComponent('protocol=opener&address=' + window.location.href)}`;
  const debugButton = document.getElementById('flowhub_debug_url');
  debugButton.className = "debug";
  debugButton.href = debugUrl;
  rt = postMessageRuntime.opener(runtimeOptions, debugButton);
} else if (queryProtocol == 'iframe') {
  rt = postMessageRuntime.iframe(runtimeOptions);
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js');
}
