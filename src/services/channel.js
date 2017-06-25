const { NotFoundError } = require('restify')
const { Channel }       = require('../repositories/channel')
const { logger }        = require('../log')

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
  const c = channels.channels.find(({ number }) => number == channelNumber)
  const channel = c ? c.channel : null
  if (!channel) return Promise.reject(new NotFoundError())
  if (state) {
    logger.info(`Activating channel ${channelNumber} (pin ${channel.pin})`)
    channel.activate()
  } else {
    logger.info(`Deactivating channel ${channelNumber} (pin ${channel.pin})`)
    channel.deactivate()
  }
  return state ? channel.activate() : channel.deactivate()
}

function resetChannels(channels, timeout) {
  channels.channels
    .filter(c => c.channel.getUptime() > timeout)
    .forEach(c => {
      const num = c.number
      const pin = c.channel.pin
      const uptime = c.channel.getUptime()
      logger.warn(`Channel ${num} (pin ${pin}) up for ${uptime}; turning off`)
      c.channel.deactivate()
    })
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
