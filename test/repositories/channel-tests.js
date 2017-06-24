require('../../src/promise')

const { beforeEach, describe, it } = require('mocha')
const { expect }                   = require('code')
const { spy }                      = require('sinon')
const { Channel }                  = require('../../src/repositories/channel')

const CHANNEL_PIN = 42

describe('channel repository', () => {
  let time, channel, writeSpy, setupSpy

  beforeEach(() => {
    const gpio = mkgpio()
    time = timeline()
    channel = new Channel(CHANNEL_PIN, gpio, time)
    writeSpy = spy(gpio, 'write')
    setupSpy = spy(gpio, 'setup')
  })

  describe('#isActive', () => {
    it('should return false initially', () => {
      expect(channel.isActive()).to.be.false()
    })

    it('should return true when activated', () => {
      return channel.activate()
        .then(() => expect(channel.isActive()).to.be.true())
    })

    it('should return false when deactivated', () => {
      return channel.activate()
        .then(() => channel.deactivate())
        .then(() => expect(channel.isActive()).to.be.false())
    })
  })

  describe('#getUptime', () => {
    it('should return 0 initially', () => {
      expect(channel.getUptime()).to.equal(0)
    })

    it('should return 0 when deactivated', () => {
      return channel.activate()
        .then(() => channel.deactivate())
        .then(() => expect(channel.getUptime()).to.equal(0))
    })

    it('should return amount of time since activation', () => {
      const deltaTime = 1000
      return channel.activate()
        .then(time.advance(deltaTime))
        .then(() => expect(channel.getUptime()).to.equal(deltaTime))
    })
  })

  describe('#activate', () => {
    it('should return a promise', () => {
      const res = channel.activate()
      expect(res).to.be.instanceOf(Promise)
    })

    it('should enable the GPIO', () => {
      return channel.activate()
        .then(() => expect(writeSpy.calledWith(CHANNEL_PIN, true)).to.be.true())
    })

    it('should noop when the GPIO is already active', () => {
      return channel.activate()
        .then(() => channel.activate())
        .then(() => expect(writeSpy.calledOnce).to.be.true())
    })

    it('should initialize the GPIO when necessary', () => {
      return channel.activate()
        .then(() => expect(setupSpy.calledWith(CHANNEL_PIN)).to.be.true())
    })

    it('should not initialize the GPIO multiple times', () => {
      return channel.activate()
        .then(() => channel.activate())
        .then(() => expect(setupSpy.calledOnce).to.be.true())
    })
  })

  describe('#deactivate', () => {
    it('should return a promise', () => {
      const res = channel.deactivate()
      expect(res).to.be.instanceOf(Promise)
    })

    it('should disable the GPIO', () => {
      return channel.activate()
        .then(() => channel.deactivate())
        .then(() => expect(writeSpy.calledWith(CHANNEL_PIN, false)).to.be.true())
    })

    it('should noop when the GPIO is already inactive', () => {
      return channel.deactivate()
        .then(() => channel.deactivate())
        .then(() => expect(writeSpy.called).to.be.false())
    })
  })
})

function timeline() {
  let t = 0
  const f = () => t
  f.advance = dt => t += dt
  return f
}

function mkgpio() {
  return {
    setup: (pin, cb) => cb(),
    write: (pin, state, cb) => cb()
  }
}
