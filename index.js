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

const name      = pkg.name
const port      = config.get('port')
const timeout   = config.get('channelTimeout') * 1000
const staticDir = config.get('staticDir')
const lock      = new Lock(config.get('lockTimeout') * 1000, timestampFactory)
const channels  = initChannels(gpio, config.get('channels'), timestampFactory)
const server    = mkServer({ name, logger, lock, channels, staticDir })

Object.keys(server.router.routes).map(key => {
  server.router.routes[key].forEach(route => {
    server.log.info({
      method: route.spec.method,
      path: route.spec.path
    }, 'addRoute')
  })
})

server.listen(port, () => {
  logger.info(`${server.name} listening on ${server.url}`)
  logger.info('Now serving propane... and propane accessories')
})

setInterval(() => resetChannels(channels, timeout), 1000)

process.stdin.resume()
process.on('SIGINT', exitHandler.bind(null, { exit: true }))
process.on('uncaughtException', exitHandler.bind(null, { exit: true }))
process.on('exit', exitHandler.bind(null, { cleanup: true }))

function exitHandler({ clean, exit }, err) {
  if (exit) {
    if (err) logger.error(err, 'Shutting down')
    else logger.warn('Shutting down')
  }

  if (clean) destroyChannels()
  if (exit) process.exit(err ? 1 : 0)
}
