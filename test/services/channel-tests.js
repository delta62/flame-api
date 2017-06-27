const { beforeEach, describe, it } = require('mocha')
const { expect }                   = require('code')
const { spy }                      = require('sinon')
const { NotFoundError }            = require('restify')
const {
  initChannels,
  setChannel,
  resetChannels,
  destroyChannels
} = require('../../src/services/channel')

const CHANNEL_TIMEOUT = 500

describe('channel service', () => {
  let time, gpio

  beforeEach(() => {
    gpio = mkgpio()
    time = timeline()
  })

  describe('#initChannels', () => {
    it('should create the correct number of channels', () => {
      const res = initChannels(gpio, [ 7, 14, 21 ], time)
      expect(res.channels).to.have.length(3)
    })

    it('should number the channels sequentially from 0', () => {
      const res = initChannels(gpio, [ 3, 2, 1 ], time)
      const numbers = res.channels.map(c => c.number)
      expect(numbers).to.equal([ 0, 1, 2 ])
    })

    it('should store a reference to the GPIO', () => {
      const res = initChannels(gpio, [ 2 ], time)
      expect(res.gpio).to.shallow.equal(gpio)
    })
  })

  describe('#setChannel', () => {
    let channels

    beforeEach(() => {
      channels = {
        channels: [
          {
            channel: {
              activate: () => Promise.resolve(),
              deactivate: () => Promise.resolve()
            },
            number: 0
          }
        ]
      }
    })

    it('should return a promise', () => {
      expect(setChannel(channels, 0, false)).to.be.instanceOf(Promise)
    })

    it('should activate the channel', () => {
      const channelSpy = spy(channels.channels[0].channel, 'activate')
      return setChannel(channels, 0, true)
        .then(() => expect(channelSpy.calledOnce).to.equal(true))
    })

    it('should deactivate the channel', () => {
      const channelSpy = spy(channels.channels[0].channel, 'deactivate')
      return setChannel(channels, 0, false)
        .then(() => expect(channelSpy.calledOnce).to.equal(true))
    })

    it('should reject when channel is out of range', done => {
      setChannel(channels, 99, true)
        .catch(err => {
          expect(err).to.be.instanceOf(NotFoundError)
          done()
        })
    })
  })

  describe('#resetChannels', () => {
    it('should deactivate channels that have timed out', () => {
      const channels = initChannels(gpio, [ 1 ], time)
      const deactivateSpy = spy(channels.channels[0].channel, 'deactivate')
      return setChannel(channels, 0, true)
        .then(() => {
          time.advance(CHANNEL_TIMEOUT + 1)
          resetChannels(channels, CHANNEL_TIMEOUT)
          expect(deactivateSpy.calledOnce).to.equal(true)
        })
    })

    it('should not deactivate channels that have not timed out', () => {
      const channels = initChannels(gpio, [ 1 ], time)
      const deactivateSpy = spy(channels.channels[0].channel, 'deactivate')
      return setChannel(channels, 0, true)
        .then(() => {
          time.advance(CHANNEL_TIMEOUT - 1)
          resetChannels(channels, CHANNEL_TIMEOUT)
          expect(deactivateSpy.called).to.equal(false)
        })
    })
  })

  describe('#destroyChannels', () => {
    it('should return a promise', () => {
      const channels = initChannels(gpio, [ 1, 2 ], time)
      expect(destroyChannels(channels)).to.be.instanceOf(Promise)
    })

    it('should deactivate each channel', () => {
      const channels = initChannels(gpio, [ 1, 2 ], time)
      const deactivateSpy = spy(channels.channels[0].channel, 'deactivate')
      return destroyChannels(channels)
        .then(() => expect(deactivateSpy.calledOnce).to.equal(true))
    })

    it('should destroy the GPIO reference', () => {
      const channels = initChannels(gpio, [ 1 ], time)
      const destroySpy = spy(gpio, 'destroy')
      return destroyChannels(channels)
        .then(() => expect(destroySpy.calledOnce).to.equal(true))
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
    write: (pin, state, cb) => cb(),
    destroy: () => undefined
  }
}
