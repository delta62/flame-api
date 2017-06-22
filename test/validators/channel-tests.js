const { describe, it }    = require('mocha')
const { expect }          = require('code')
const { BadRequestError } = require('restify')
const { validate }        = require('../../src/validators/channel')

describe('channel validator', () => {
  it('should return a promise', () => {
    const res = validate({ state: true, lockId: 'a' })
    expect(res).to.be.instanceOf(Promise)
  })

  it('should accept a true state', () => {
    return validate({ state: true, lockId: 'a' })
  })

  it('should accept a false state', () => {
    return validate({ state: true, lockId: 'a' })
  })

  it('should accept a string lockId', () => {
    return validate({ state: true, lockId: 'a' })
  })

  it('should reject null lockIds', done => {
    validate({ state: true, lockId: null })
      .catch(err => {
        expect(err.message).to.contain('lockId')
        done()
      })
  })

  it('should reject empty lockIds', done => {
    validate({ state: true, lockId: null })
      .catch(err => {
        expect(err.message).to.contain('lockId')
        done()
      })
  })

  it('should use BadRequestError when rejecting', done => {
    validate('foobar')
      .catch(err => {
        expect(err).to.be.instanceOf(BadRequestError)
        done()
      })
  })
})
