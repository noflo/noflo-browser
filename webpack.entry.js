var exported = {
  noflo: require('noflo'),
  'noflo-runtime-postmessage': require('noflo-runtime-postmessage'),
  'fbp-protocol-client': require('fbp-protocol-client'),
  'noflo-runtime': require('noflo-runtime'),
};

if (window) {
  window.require = function (moduleName) {
    if (exported[moduleName]) {
      return exported[moduleName];
    }
    throw new Error('Module ' + moduleName + ' not available');
  };
}


