const runtimeClient = require('noflo-runtime');
const protocolClient = require('fbp-protocol-client');
const noflo = require('noflo');

describe('IFRAME runtime', function() {
  let runtime = null;

  const send = function(protocol, command, payload) {
    const msg = {
      protocol,
      command,
      payload
    };
    const serialized = JSON.stringify(msg);
    iframe.postMessage(serialized, '*');
  };

  before(function(done) {
    this.timeout(20000);
    const fixtureContainer = document.createElement('div');
    document.body.appendChild(fixtureContainer);
    if (!fixtureContainer) {
      return done(new Error('Fixture container not found'));
    }
    const transport = protocolClient.getTransport('iframe');
    runtime = new transport({
      address: '/base/browser/everything.html?fbp_noload=true&fbp_protocol=iframe',
      protocol: 'iframe'
    });
    runtime.setParentElement(fixtureContainer);
    runtime.once('connected', () =>
      setTimeout(() => done()
      , 100)
    );
    runtime.connect();
  });
  describe('Runtime Protocol', () =>
    describe('requesting runtime metadata', function() {
      before(function(done) {
        if (!runtime.isConnected()) {
          return done(new Error("Not connected to runtime"));
        }
        done();
      });
      it('should provide it back', function(done) {
        this.timeout(4000);
        runtime.once('runtime', function(msg) {
          chai.expect(msg.command).to.equal('runtime');
          chai.expect(msg.payload).to.be.an('object');
          chai.expect(msg.payload.type).to.equal('noflo-browser');
          chai.expect(msg.payload.capabilities).to.be.an('array');
          done();
        });
        runtime.sendRuntime('getruntime', {});
    });
  })
);
    
  describe('Component Protocol', () =>
    describe('requesting component listing', function() {
      before(function(done) {
        if (!runtime.isConnected()) {
          return done(new Error("Not connected to runtime"));
        }
        done();
      });
      it('should provide it back', function(done) {
        this.timeout(40000);
        let received = 0;
        var receive = function(msg) {
          if (msg.command === 'component') {
            chai.expect(msg.payload).to.be.an('object');
            received++;
          }
          if (msg.command === 'componentsready') {
            chai.expect(msg.payload).to.equal(received);
            chai.expect(received).to.be.above(5);
            runtime.removeListener('component', receive);
            done();
          }
        };
        runtime.on('component', receive);
        runtime.sendComponent('list');
      });
    })
  );
  describe('fixture graph running', function() {
    describe('with Clock graph', function() {
      let graph = null;
      before(function(done) {
        if (!runtime.isConnected()) {
          return done(new Error("Not connected to runtime"));
        }
        done();
      });
      it('should be able to send the graph to runtime', function(done) {
        this.timeout(4000);
        noflo.graph.loadFile('/base/spec/fixtures/Clock.json', function(err, g) {
          if (err) { return done(err); }
          graph = g;
          runtimeClient.connection.sendGraph(graph, runtime, done);
        });
      });
      it('should be able to start the graph', function(done) {
        var receive = function(msg) {
          if (msg.running) {
            runtime.removeListener('error', receiveError);
            runtime.removeListener('execution', receive);
            done();
            done = function() {};
          }
        };
        var receiveError = function(err) {
          console.log(err);
          done(err);
          done = function() {};
        };
        runtime.on('network', function(msg) {
          if (msg.command !== 'error') { return; }
          receiveError(new Error(msg.payload.message));
          done = function() {};
        });
        runtime.once('error', receiveError);
        runtime.on('execution', receive);
        runtime.setMain(graph);
        runtime.start();
      });
      it('should be able to stop the graph', function(done) {
        var receive = function(msg) {
          if (!msg.running) {
            runtime.removeListener('error', receiveError);
            runtime.removeListener('execution', receive);
            done();
          }
        };
        var receiveError = err => done(err);
        runtime.once('error', receiveError);
        runtime.on('execution', receive);
        runtime.stop();
      });
    });
    describe('with React Todo graph', function() {
      let graph = null;
      before(function(done) {
        if (!runtime.isConnected()) {
          return done(new Error("Not connected to runtime"));
        }
        done();
      });
      it('should be able to send the graph to runtime', function(done) {
        this.timeout(4000);
        noflo.graph.loadFile('/base/spec/fixtures/ReactTodo.json', function(err, g) {
          if (err) { return done(err); }
          graph = g;
          runtimeClient.connection.sendGraph(graph, runtime, done);
        });
      });
      it('should be able to start the graph', function(done) {
        var receive = function(msg) {
          if (msg.running) {
            runtime.removeListener('error', receiveError);
            runtime.removeListener('execution', receive);
            done();
          }
        };
        var receiveError = err => done(err);
        runtime.once('error', receiveError);
        runtime.on('network', function(msg) {
          if (msg.command !== 'error') { return; }
          receiveError(new Error(msg.payload.message));
          done = function() {};
        });
        runtime.on('execution', receive);
        runtime.setMain(graph);
        runtime.start();
      });
      it('should be able to stop the graph', function(done) {
        var receive = function(msg) {
          if (!msg.running) {
            runtime.removeListener('error', receiveError);
            runtime.removeListener('execution', receive);
            done();
          }
        };
        var receiveError = err => done(err);
        runtime.once('error', receiveError);
        runtime.on('execution', receive);
        runtime.stop();
      });
    });
  });
});
