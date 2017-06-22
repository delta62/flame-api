const pkg                            = require('../package.json')
const config                         = require('config')
const { createServer, bodyParser }   = require('restify')
const { createLogger }               = require('bunyan')
const { reqStartTimer, reqEndTimer } = require('./middleware/timer')
const { timestampFactory }           = require('./timestamp')
const { Lock }                       = require('./repositories/lock')
const { statusGetHandler }           = require('./handlers/status')
const {
  lockGetHandler,
  lockPostHandler
} = require('./handlers/lock')

const logger = createLogger({ name: pkg.name })
const server = createServer({
  name: pkg.name,
  log:  logger
})

server.lock = new Lock(config.get('lockTimeout') * 1000, timestampFactory)

server.use(bodyParser({ mapParams: false }))
server.use(reqStartTimer)

server.get('/status',       statusGetHandler)
server.get('/burner/lock',  lockGetHandler)
server.post('/burner/lock', lockPostHandler)

server.on('after', (req, res) => {
  reqEndTimer(req)
  server.log.info({
    status:  res.statusCode,
    method:  req.method,
    path:    req.path(),
    resTime: req.time
  }, 'after')
})

server.on('uncaughtException', (req, res, route, err) => {
  err && err instanceof Error && server.log.error(err)
  res.send(err)
})

module.exports = { server }
