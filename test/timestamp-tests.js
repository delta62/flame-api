const { describe, it }     = require('mocha')
const { expect }           = require('code')
const { timestampFactory } = require('../src/timestamp')

describe('timestamp factory', () => {
  it('should return a number', () => {
    expect(timestampFactory()).to.be.a.number()
  })

  it('should return larger numbers as time progresses', done => {
    const ts1 = timestampFactory()
    setTimeout(() => {
      const ts2 = timestampFactory()
      expect(ts2).to.be.greaterThan(ts1)
      done()
    }, 10)
  })
})
