const { describe, it } = require('mocha')
const { expect }       = require('code')
const { spy }          = require('sinon')
const {
  BadRequestError,
  ConflictError
} = require('restify')
const {
  lockGetHandler,
  lockPostHandler
} = require('../../src/handlers/lock')

describe('lock handler', () => {
  describe('#lockGetHandler', () => {
    it('should call next', done => {
      const server = initServer({ isLocked: true })
      lockGetHandler.call(server, req(), res(), done)
    })

    it('should indicate that the burner is locked', done => {
      const server = initServer({ isLocked: true })
      const verifier = data => expect(data.state).to.equal('LOCKED')
      lockGetHandler.call(server, req(), resJSON(verifier), done)
    })

    it('should indicate that the burner is unlocked', done => {
      const server = initServer({ isLocked: false })
      const verifier = data => expect(data.state).to.equal('UNLOCKED')
      lockGetHandler.call(server, req(), resJSON(verifier), done)
    })
  })


  describe('#lockPostHandler', () => {
    it('should call next', done => {
      const server = initServer({ isLocked: true })
      const body = { state: 'LOCKED', lockId: 'a' }
      lockPostHandler.call(server, req(body), res(), done)
    })

    it('should return 200 on success', done => {
      const server = initServer({ isLocked: true })
      const body = { state: 'LOCKED', lockId: 'a' }
      const verifier = status => expect(status).to.equal(200)
      lockPostHandler.call(server, req(body), res(verifier), done)
    })

    it('should include the idle timeout of the lock', done => {
      const server = initServer({ isLocked: false })
      const body = { state: 'LOCKED', lockId: 'a' }
      const verifier = data => expect(data.timeout).to.be.a.number()
      lockPostHandler.call(server, req(body), resJSON(verifier), done)
    })

    it('should return 400 when bad input is sent', done => {
      const server = initServer({ isLocked: true })
      const body = { state: 'FOO', lockId: [ 'bar' ] }
      const cb = expectError(BadRequestError, done)
      lockPostHandler.call(server, req(body), res(), cb)
    })

    it('should return 409 when the burner is already locked', done => {
      const server = initServer({ isLocked: true }, true)
      const body = { state: 'LOCKED', lockId: 'a' }
      const cb = expectError(ConflictError, done)
      lockPostHandler.call(server, req(body), res(), cb)
    })

    it('should deactivate channels when unlocking', done => {
      const server = initServer({ isLocked: true })
      const body = { state: 'UNLOCKED', lockId: 'a' }
      const channelDeactivateSpy = spy(server.channels.channels[0].channel, 'deactivate')
      lockPostHandler.call(server, req(body), res(), () => {
        expect(channelDeactivateSpy.calledOnce).to.be.true()
        done()
      })
    })
  })
})

function expectError(err, done) {
  return result => {
    const parentClass = err || Error
    if (!(result instanceof parentClass)) {
      done(new Error('Expected an exception, but the correct type was not thrown'))
    } else {
      done()
    }
  }
}

function initServer({ isLocked }, boom) {
  const props = {
    lock: {
      isLocked: () => isLocked,
      lock: () => {
        if (boom) throw new ConflictError()
      }
    },
    channels: {
      channels: [
        {
          channel: {
            getUptime: () => 12,
            isActive: () => true,
            deactivate: () => Promise.resolve()
          }
        }
      ]
    }
  }
  return server(props)
}

function req(body) {
  return { body }
}

function res(cb) {
  if (!cb) cb = () => undefined
  return {
    json: () => undefined,
    send: data => { cb(data) }
  }
}

function resJSON(cb) {
  return {
    json: data => { cb(data) }
  }
}

function server(props) {
  return Object.assign({ }, props)
}
