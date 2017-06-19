const pkg            = require('../package.json')
const restify        = require('restify')
const statusHandler  = require('./handlers/status')
const bunyan         = require('bunyan')
const middleware     = require('./middleware/timer')

const logger = bunyan.createLogger({ name: pkg.name })
const server = restify.createServer({
  name: pkg.name,
  log:  logger
})

server.use(middleware.reqStartTimer)

server.get('/status', statusHandler.statusGetHandler)

server.on('after', (req, res) => {
  middleware.reqEndTimer(req)
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
