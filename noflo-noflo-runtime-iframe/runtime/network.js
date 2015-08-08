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
    context.parent.postMessage(JSON.stringify({
      protocol: protocol,
      command: topic,
      payload: payload
    }), ctx.href);
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
      var data;
      if (typeof message.data === 'string') {
        data = JSON.parse(message.data);
      } else {
        data = message.data;
      }
      if (!data.protocol) {
        return;
      }
      if (!data.command) {
        return;
      }
      if (data.protocol === 'iframe' && data.command === 'setcontent') {
        document.body.innerHTML = data.payload;
        return;
      }
      runtime.receive(data.protocol, data.command, data.payload, {
        href: message.origin
      });
    });
    return runtime;
  };
})(window);
