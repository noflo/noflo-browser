(function (context) {
  var noflo = context.require('noflo');
  var Base = context.require('noflo-noflo-runtime-base');

  var Iframe = function (options) {
    if (!options) {
      options = {};
    }

    if (options.catchExceptions) {
      // Can't use bind until https://github.com/ariya/phantomjs/issues/10522 is fixed
      var self = this;
      context.onerror = function (err) {
        self.send('network', 'error', {
          message: err.toString()
        }, {
          href: self.context ? self.context.href : context.parent.location.href
        });
        return true;
      };
    }

    if (!options.defaultPermissions) {
      // The iframe runtime is run on user's own computer, so default to all access allowed
      options.defaultPermissions = [
        'protocol:graph',
        'protocol:component',
        'protocol:network',
        'protocol:runtime',
        'component:setsource',
        'component:getsource'
      ];
    }

    this.prototype.constructor.apply(this, arguments);
    this.receive = this.prototype.receive;
    this.canDo = this.prototype.canDo;
    this.getPermitted = this.prototype.getPermitted;
  };
  Iframe.prototype = Base;
  Iframe.prototype.send = function (protocol, topic, payload, ctx) {
    if (payload instanceof Error) {
      payload = {
        message: payload.toString()
      };
    }
    if (this.context) {
      ctx = this.context;
    }
    context.parent.postMessage({
      protocol: protocol,
      command: topic,
      payload: payload
    }, ctx.href);
  };
  Iframe.prototype.sendAll = function (protocol, topic, payload) {
    this.send(protocol, topic, payload, window.context);
  };
  Iframe.prototype.start = function () {
    // Ignored, nothing to do
  };

  context.NofloIframeRuntime = function (options) {
    if (typeof options.catchExceptions === 'undefined') {
      options.catchExceptions = true;
      if (context.location.search && context.location.search.substring(1) === 'debug') {
        options.catchExceptions = false;
      }
    }
    var runtime = new Iframe(options);
    context.addEventListener('message', function (message) {
      if (!message.data.protocol) {
        return;
      }
      if (!message.data.command) {
        return;
      }
      if (message.data.protocol === 'iframe' && message.data.command === 'setcontent') {
        document.body.innerHTML = message.data.payload;
        return;
      }
      runtime.receive(message.data.protocol, message.data.command, message.data.payload, {
        href: message.origin
      });
    });
    return runtime;
  };
})(window);
