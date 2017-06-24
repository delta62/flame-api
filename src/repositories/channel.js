function Channel(pin, gpio, timestampFactory) {
  this.pin = pin
  this.gpio = gpio
  this.ts = timestampFactory
  this.active = false
  this.activatedAt = 0
  this.initPromise = null
}

Channel.prototype.isActive = function() {
  return this.active
}

Channel.prototype.getUptime = function() {
  if (!this.active) return 0
  return this.ts() - this.activatedAt
}

Channel.prototype.activate = function() {
  if (this.active) return Promise.resolve()

  this.active = true
  this.activatedAt = this.ts()

  return this._init()
    .then(() => Promise.fromNodeCallback(this.gpio.write, this.pin, true))
}

Channel.prototype.deactivate = function() {
  if (!this.active) return Promise.resolve()

  return this._init()
    .then(() => Promise.fromNodeCallback(this.gpio.write, this.pin, false))
    .then(() => {
      this.active = false
      this.activatedAt = 0
    })
}

Channel.prototype._init = function() {
  if (this.initPromise) return this.initPromise

  this.initPromise = Promise.fromNodeCallback(this.gpio.setup, this.pin)
  return this.initPromise
}

module.exports = { Channel }
