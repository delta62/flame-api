const { ConflictError } = require('restify')

function Lock(timeout, timestampFactory) {
  this.acquired = 0
  this.acquiredBy = null
  this.timeout = timeout
  this.ts = timestampFactory
}

Lock.prototype.isLocked = function() {
  const now = this.ts()
  const oldestValidLock = now - this.timeout
  return this.acquired >= oldestValidLock && !!this.acquiredBy
}

Lock.prototype.isLockedBy = function(id) {
  return this.isLocked() && this.acquiredBy === id
}

Lock.prototype.lock = function(id) {
  this._verifyOwnership(id)
  this.acquired = this.ts()
  this.acquiredBy = id
}

Lock.prototype.unlock = function(id) {
  this._verifyOwnership(id)
  this.acquired = 0
  this.acquiredBy = null
}

Lock.prototype._verifyOwnership = function(id) {
  if (this.isLocked() && !this.isLockedBy(id)) {
    const msg = `Lock held by ID ${this.acquiredBy}; ${id} cannot acquire it.`
    throw new ConflictError(msg)
  }
}

module.exports = { Lock }
