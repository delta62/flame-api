const { describe, it }                   = require('mocha')
const { ConflictError, BadRequestError } = require('restify')
const { expect }                         = require('code')
const { spy }                            = require('sinon')
const { channelPostHandler }             = require('../../src/handlers/channel')

describe('channel handlers', () => {
  describe('#channelPostHandler', () => {
    it('should call next', done => {
      const server = initServer({ isLocked: true })
      const body = { state: false, lockId: 'a' }
      channelPostHandler.call(server, req(body, { channel: 0 }), res(), done)
    })

    it('should reject with BadRequestError when the request is invalid', done => {
      const server = initServer({ isLocked: true })
      const body = { foo: 'bar' }
      const cb = expectError(BadRequestError, done)
      channelPostHandler.call(server, req(body, { channel: 0 }), res(), cb)
    })

    it('should reject with ConflictError when the lock state is invalid', done => {
      const server = initServer({ isLocked: true }, true)
      const body = { state: false, lockId: 'a' }
      const cb = expectError(ConflictError, done)
      channelPostHandler.call(server, req(body, { channel: 0 }), res(), cb)
    })

    it('should reset the lock timeout', done => {
      const server = initServer({ isLocked: true })
      const lockSpy = spy(server.lock, 'lock')
      const body = { state: true, lockId: 'a' }
      const cb = () => {
        expect(lockSpy.calledOnce).to.equal(true)
        done()
      }
      channelPostHandler.call(server, req(body, { channel: 0 }), res(), cb)
    })

    it('should return 200 on success', done => {
      const server = initServer({ isLocked: true })
      const body = { state: true, lockId: 'a' }
      const verifier = status => expect(status).to.equal(200)
      channelPostHandler.call(server, req(body, { channel: 0 }), res(verifier), done)
    })

    it('should activate the channel', done => {
      const server = initServer({ isLocked: true })
      const channelSpy = spy(server.channels.channels[0].channel, 'activate')
      const body = { state: true, lockId: 'a' }
      const cb = () => {
        expect(channelSpy.calledOnce).to.equal(true)
        done()
      }
      channelPostHandler.call(server, req(body, { channel: 0 }), res(), cb)
    })

    it('should deactivate the channel', done => {
      const server = initServer({ isLocked: true })
      const channelSpy = spy(server.channels.channels[0].channel, 'deactivate')
      const body = { state: false, lockId: 'a' }
      const cb = () => {
        expect(channelSpy.calledOnce).to.equal(true)
        done()
      }
      channelPostHandler.call(server, req(body, { channel: 0 }), res(), cb)
    })
  })
})

function initServer({ isLocked }, boom) {
  const props = {
    lock: {
      isLocked: () => isLocked,
      lock: () => {
        if (boom) throw new ConflictError()
      },
      isLockedBy: () => !boom
    },
    channels: {
      channels: [ {
        number: 0,
        channel: {
          activate: () => undefined,
          deactivate: () => undefined
        }
      } ]
    }
  }
  return server(props)
}

function req(body, params) {
  return {
    body,
    params
  }
}

function res(cb) {
  if (!cb) cb = () => undefined
  return {
    json: () => undefined,
    send: data => { cb(data) }
  }
}

function server(props) {
  return Object.assign({ }, props)
}

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
