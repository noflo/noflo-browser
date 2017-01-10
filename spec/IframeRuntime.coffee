runtimeClient = require 'noflo-runtime'
protocolClient = require 'fbp-protocol-client'
noflo = require 'noflo'

describe 'IFRAME runtime', ->
  runtime = null

  send = (protocol, command, payload) ->
    msg =
      protocol: protocol
      command: command
      payload: payload
    serialized = JSON.stringify(msg)
    iframe.postMessage serialized, '*'

  before (done) ->
    @timeout 20000
    fixtureContainer = document.getElementById('fixtures')
    if !fixtureContainer
      return done(new Error('Fixture container not found'))
    transport = protocolClient.getTransport 'iframe'
    runtime = new transport
      address: '../browser/everything.html?fbp_noload=true&fbp_protocol=iframe'
      protocol: 'iframe'
    runtime.setParentElement fixtureContainer
    runtime.once 'connected', ->
      setTimeout ->
        done()
      , 100
    runtime.connect()
  describe 'Runtime Protocol', ->
    describe 'requesting runtime metadata', ->
      before (done) ->
        unless runtime.isConnected()
          return done new Error "Not connected to runtime"
        done()
      it 'should provide it back', (done) ->
        @timeout 4000
        runtime.once 'runtime', (msg) ->
          chai.expect(msg.command).to.equal 'runtime'
          chai.expect(msg.payload).to.be.an 'object'
          chai.expect(msg.payload.type).to.equal 'noflo-browser'
          chai.expect(msg.payload.capabilities).to.be.an 'array'
          done()
        runtime.sendRuntime 'getruntime', {}
    
  describe 'Component Protocol', ->
    describe 'requesting component listing', ->
      before (done) ->
        unless runtime.isConnected()
          return done new Error "Not connected to runtime"
        done()
      it 'should provide it back', (done) ->
        @timeout 40000
        received = 0
        receive = (msg) ->
          if msg.command == 'component'
            chai.expect(msg.payload).to.be.an 'object'
            received++
          if msg.command == 'componentsready'
            chai.expect(msg.payload).to.equal received
            chai.expect(received).to.be.above 5
            runtime.removeListener 'component', receive
            done()
        runtime.on 'component', receive
        runtime.sendComponent 'list'
  describe 'fixture graph running', ->
    describe 'with Clock graph', ->
      graph = null
      before (done) ->
        unless runtime.isConnected()
          return done new Error "Not connected to runtime"
        done()
      it 'should be able to send the graph to runtime', (done) ->
        @timeout 4000
        noflo.graph.loadFile './fixtures/Clock.json', (err, g) ->
          return done err if err
          graph = g
          runtimeClient.connection.sendGraph graph, runtime, done
      it 'should be able to start the graph', (done) ->
        receive = (msg) ->
          if msg.running
            runtime.removeListener 'error', receiveError
            runtime.removeListener 'execution', receive
            done()
        receiveError = (err) ->
          done err
        runtime.once 'error', receiveError
        runtime.on 'execution', receive
        runtime.setMain graph
        runtime.start()
      it 'should be able to stop the graph', (done) ->
        receive = (msg) ->
          unless msg.running
            runtime.removeListener 'error', receiveError
            runtime.removeListener 'execution', receive
            done()
        receiveError = (err) ->
          done err
        runtime.once 'error', receiveError
        runtime.on 'execution', receive
        runtime.stop()
    describe 'with React Todo graph', ->
      graph = null
      before (done) ->
        unless runtime.isConnected()
          return done new Error "Not connected to runtime"
        done()
      it 'should be able to send the graph to runtime', (done) ->
        @timeout 4000
        noflo.graph.loadFile './fixtures/ReactTodo.json', (err, g) ->
          return done err if err
          graph = g
          runtimeClient.connection.sendGraph graph, runtime, done
      it 'should be able to start the graph', (done) ->
        receive = (msg) ->
          if msg.running
            runtime.removeListener 'error', receiveError
            runtime.removeListener 'execution', receive
            done()
        receiveError = (err) ->
          done err
        runtime.once 'error', receiveError
        runtime.on 'execution', receive
        runtime.setMain graph
        runtime.start()
      it 'should be able to stop the graph', (done) ->
        receive = (msg) ->
          unless msg.running
            runtime.removeListener 'error', receiveError
            runtime.removeListener 'execution', receive
            done()
        receiveError = (err) ->
          done err
        runtime.once 'error', receiveError
        runtime.on 'execution', receive
        runtime.stop()
