const { createServer, bodyParser }   = require('restify')
const { reqStartTimer, reqEndTimer } = require('./middleware/timer')
const { statusGetHandler }           = require('./handlers/status')
const { channelPostHandler }         = require('./handlers/channel')
const {
  lockGetHandler,
  lockPostHandler
} = require('./handlers/lock')

function mkServer({ name, logger, lock, channels }) {
  const server = createServer({
    name,
    log: logger
  })

  Object.assign(server, lock, channels)

  server.use(bodyParser({ mapParams: false }))
  server.use(reqStartTimer)

  server.get('/status',                   statusGetHandler)
  server.get('/burner/lock',              lockGetHandler)
  server.post('/burner/lock',             lockPostHandler)
  server.post('/burner/channel/:channel', channelPostHandler)

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

  return server
}

module.exports = { mkServer }
