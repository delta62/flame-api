const { describe, it }    = require('mocha')
const { expect }          = require('code')
const { BadRequestError } = require('restify')
const { validate }        = require('../../src/validators/lock')

describe('lock validator', () => {
  it('should return a promise', () => {
    const res = validate({ state: 'LOCKED', lockId: 'a' })
    expect(res).to.be.instanceOf(Promise)
  })

  it('should accept a LOCKED state', () => {
    return validate({ state: 'LOCKED', lockId: 'a' })
  })

  it('should accept an UNLOCKED state', () => {
    return validate({ state: 'UNLOCKED', lockId: 'a' })
  })

  it('should accept a string lockId', () => {
    return validate({ state: 'LOCKED', lockId: 'a' })
  })

  it('should reject null lockIds', done => {
    validate({ state: 'LOCKED', lockId: null })
      .catch(err => {
        expect(err.message).to.contain('lockId')
        done()
      })
  })

  it('should reject empty lockIds', done => {
    validate({ state: 'LOCKED', lockId: '' })
      .catch(err => {
        expect(err.message).to.contain('lockId')
        done()
      })
  })

  it('should reject unknown lock states', done => {
    validate({ state: 'foo', lockId: 'b' })
      .catch(err => {
        expect(err.message).to.contain('state')
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
