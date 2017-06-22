const { beforeEach, describe, it } = require('mocha')
const { ConflictError }            = require('restify')
const { expect }                   = require('code')
const { Lock }                     = require('../../src/repositories/lock')

const ONE_SEC = 1000
const LOCK_TIMEOUT = ONE_SEC * 30

describe('lock repository', () => {
  let lock, time

  beforeEach(() => {
    time = timeline()
    lock = new Lock(LOCK_TIMEOUT, time)
  })

  describe('#isLocked', () => {
    it('should return false initially', () => {
      expect(lock.isLocked()).to.be.false()
    })

    it('should return false when lock has expired', () => {
      lock.lock('a')
      time.advance(2 * LOCK_TIMEOUT)
      expect(lock.isLocked()).to.be.false()
    })

    it('should return true when locked', () => {
      lock.lock('a')
      expect(lock.isLocked()).to.be.true()
    })

    it('should return true when lock has not expired', () => {
      lock.lock('a')
      time.advance(ONE_SEC)
      expect(lock.isLocked()).to.be.true()
    })
  })

  describe('#isLockedBy', () => {
    it('should return false when not locked', () => {
      expect(lock.isLockedBy('foo')).to.be.false()
    })

    it('should return false when lock has expired', () => {
      lock.lock('foo')
      time.advance(2 * LOCK_TIMEOUT)
      expect(lock.isLockedBy('foo')).to.be.false()
    })

    it('should return false when locked by a different id', () => {
      lock.lock('foo')
      expect(lock.isLockedBy('bar')).to.be.false()
    })

    it('should return true when locked by the given id', () => {
      lock.lock('foo')
      expect(lock.isLockedBy('foo')).to.be.true()
    })
  })

  describe('#lock', () => {
    it('should create a new lock', () => {
      lock.lock('foo')
      expect(lock.isLocked()).to.be.true()
    })

    it('should reset the timeout of an existing lock', () => {
      lock.lock('foo')
      time.advance(LOCK_TIMEOUT * .9)
      lock.lock('foo')
      time.advance(LOCK_TIMEOUT * .9)
      expect(lock.isLocked()).to.be.true()
    })

    it('should throw when already locked by a different id', () => {
      lock.lock('foo')
      expect(() => lock.lock('bar')).to.throw(ConflictError)
    })
  })

  describe('#unlock', () => {
    it('should clear an existing lock', () => {
      lock.lock('foo')
      lock.unlock('foo')
      expect(lock.isLocked()).to.be.false()
    })

    it('should noop when there is no lock', () => {
      lock.unlock('foo')
      expect(lock.isLocked()).to.be.false()
    })

    it('should throw when already locked by a different id', () => {
      lock.lock('foo')
      expect(() => lock.unlock('bar')).to.throw(ConflictError)
    })
  })

  function timeline() {
    let t = 0
    const f = () => t
    f.advance = dt => t += dt
    return f
  }
})
