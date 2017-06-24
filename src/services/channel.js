const { NotFoundError } = require('restify')
const { Channel }       = require('../repositories/channel')

function initChannels(gpio, channels, timestampFactory) {
  const cs = channels.map((pin, idx) => ({
    channel: new Channel(pin, gpio, timestampFactory),
    number:  idx
  }))
  return {
    channels: cs,
    gpio
  }
}

function setChannel(channels, channelNumber, state) {
  const c = channels.channels.find(({ number }) => number === channelNumber)
  const channel = c ? c.channel : null
  if (!channel) return Promise.reject(new NotFoundError())
  return state ? channel.activate() : channel.deactivate()
}

function resetChannels(channels, timeout) {
  channels.channels
    .filter(c => c.channel.getUptime() > timeout)
    .forEach(c => c.channel.deactivate())
}

function destroyChannels(channels) {
  let channelPromises = channels.channels.map(c => c.channel.deactivate())
  return Promise.all(channelPromises)
    .then(() => channels.gpio.destroy())
}

module.exports = {
  destroyChannels,
  initChannels,
  resetChannels,
  setChannel
}
