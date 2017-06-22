const lockValidator = require('../validators/lock')

function lockGetHandler(req, res, next) {
  Promise.resolve(this.lock.isLocked() ? 'LOCKED' : 'UNLOCKED')
    .then(state => ({ state }))
    .then(res.json.bind(res))
    .then(next)
    .catch(next)
}

function lockPostHandler(req, res, next) {
  lockValidator.validate(req.body)
    .then(({ state, lockId }) => {
      if (state === 'LOCKED') this.lock.lock(lockId)
      else this.lock.unlock(lockId)
    })
    .then(() => res.send(200))
    .then(next)
    .catch(next)
}

module.exports = {
  lockGetHandler,
  lockPostHandler
}
