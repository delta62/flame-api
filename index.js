const pkg                  = require('./package.json')
const config               = require('config')
const gpio                 = require('rpi-gpio')
const { logger }           = require('./src/log')
const { mkServer }         = require('./src/server')
const { Lock }             = require('./src/repositories/lock')
const { timestampFactory } = require('./src/timestamp')
const {
  initChannels,
  resetChannels,
  destroyChannels
}                          = require('./src/services/channel')

const name     = pkg.name
const port     = config.get('port')
const timeout  = config.get('channelTimeout') * 1000
const lock     = new Lock(config.get('lockTimeout') * 1000, timestampFactory)
const channels = initChannels(gpio, config.get('channels'), timestampFactory)
const server   = mkServer({ name, logger, lock, channels })

server.listen(port, () => {
  logger.info(`${server.name} listening on ${server.url}`)
})

setInterval(() => resetChannels(channels, timeout), 1000)

process.on('exit', () => {
  logger.info('Shutting down')
  destroyChannels()
})
