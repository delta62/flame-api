const {
  createServer,
  bodyParser,
  CORS,
  serveStatic
}                                    = require('restify')
const { reqStartTimer, reqEndTimer } = require('./middleware/timer')
const { requireJson }                = require('./middleware/require-json')
const { statusGetHandler }           = require('./handlers/status')
const { channelPostHandler }         = require('./handlers/channel')
const {
  lockGetHandler,
  lockPostHandler
}                                    = require('./handlers/lock')

function mkServer({ name, logger, lock, channels, staticDir }) {
  const server = createServer({
    name,
    log: logger
  })

  Object.assign(server, { lock, channels })

  server.use(CORS())
  server.use(requireJson)
  server.use(bodyParser({ mapParams: false }))
  server.use(reqStartTimer)

  server.get('/', (req, res, next) => {
    res.header('Location', '/static')
    res.send(301)
    next()
  })
  server.get(/^\/static/, serveStatic({
    directory: process.cwd(),
    default: 'index.html'
  }))

  server.get('/status',                   statusGetHandler)
  server.get('/burner/lock',              lockGetHandler)
  server.post('/burner/lock',             lockPostHandler)
  server.post('/burner/channel/:channel', channelPostHandler)

  server.on('after', (req, res, route, err) => {
    reqEndTimer(req)
    const logData = {
      status:  res.statusCode,
      method:  req.method,
      path:    req.path(),
      resTime: req.reqTime
    }

    let logLevel = 'info'
    if (err && err instanceof Error) {
      logLevel = 'error'
      logData.err = err
    }

    server.log[logLevel](logData, 'end')
  })

  server.on('uncaughtException', (req, res, route, err) => {
    err && err instanceof Error && server.log.error(err)
    res.send(err)
  })

  return server
}

module.exports = { mkServer }
