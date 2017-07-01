const { validate }      = require('../validators/lock')
const { resetChannels } = require('../services/channel')

function lockGetHandler(req, res, next) {
  Promise.resolve(this.lock.isLocked() ? 'LOCKED' : 'UNLOCKED')
    .then(state => ({ state }))
    .then(res.json.bind(res))
    .then(next)
    .catch(next)
}

function lockPostHandler(req, res, next) {
  validate(req.body)
    .then(({ state, lockId }) => {
      if (state === 'LOCKED') {
        this.lock.lock(lockId)
      } else {
        resetChannels(this.channels, 0)
        this.lock.unlock(lockId)
      }
    })
    .then(() => res.send(200))
    .then(next)
    .catch(next)
}

module.exports = {
  lockGetHandler,
  lockPostHandler
}
