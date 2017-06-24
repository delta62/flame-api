require('promise-do')

const { ConflictError } = require('restify')
const { validate }   = require('../validators/channel')
const { setChannel } = require('../services/channel')

function channelPostHandler(req, res, next) {
  validate(req.body)
    .do(body => {
      if (!this.lock.isLockedBy(body.lockId)) throw new ConflictError()
      this.lock.acquire(body.lockId)
    })
    .then(body => setChannel(this.channels, req.params.channel, body.state))
    .then(() => res.send(200))
    .then(next)
    .catch(next)
}

module.exports = { channelPostHandler }
