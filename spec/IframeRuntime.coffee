describe 'IFRAME runtime', ->
  iframe = null
  origin = null
  listener = null

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
    iframeElement = document.createElement('iframe')
    iframeElement.sandbox = 'allow-scripts'
    iframeElement.src = '../browser/everything.html?fbp_noload=true&fbp_protocol=iframe'

    iframeElement.onload = ->
      iframe = iframeElement.contentWindow
      setTimeout (->
        done()
      ), 100

    origin = window.location.origin
    fixtureContainer.appendChild iframeElement
  describe 'Runtime Protocol', ->
    describe 'requesting runtime metadata', ->
      it 'should provide it back', (done) ->
        @timeout 4000

        listener = (message) ->
          window.removeEventListener 'message', listener, false
          listener = null
          msg = JSON.parse(message.data)
          chai.expect(msg.protocol).to.equal 'runtime'
          chai.expect(msg.command).to.equal 'runtime'
          chai.expect(msg.payload).to.be.an 'object'
          chai.expect(msg.payload.type).to.equal 'noflo-browser'
          chai.expect(msg.payload.capabilities).to.be.an 'array'
          done()

        window.addEventListener 'message', listener, false
        send 'runtime', 'getruntime', ''
  describe 'Component Protocol', ->
    describe 'requesting component listing', ->
      it 'should provide it back', (done) ->
        @timeout 40000
        received = 0
        if listener
          return done(new Error('Previous test still listening, abort'))

        listener = (message) ->
          msg = JSON.parse(message.data)
          if msg.protocol != 'component'
            return
          if msg.command == 'component'
            chai.expect(msg.payload).to.be.an 'object'
            received++
          if msg.command == 'componentsready'
            chai.expect(msg.payload).to.equal received
            chai.expect(received).to.be.above 5
            window.removeEventListener 'message', listener, false
            listener = null
            done()

        window.addEventListener 'message', listener, false
        send 'component', 'list', 'bar'
