const pkg            = require('../package.json')
const restify        = require('restify')
const statusHandler  = require('./handlers/status')
const bunyan         = require('bunyan')

const logger = bunyan.createLogger({ name: pkg.name })
const server = restify.createServer({
  name: pkg.name,
  log:  logger
})

server.get('/status', statusHandler.statusGetHandler)

server.on('after', (req, res) => {
  server.log.info({
    status: res.statusCode,
    method: req.method,
    path:   req.path()
  }, 'after')
})

server.on('uncaughtException', (req, res, route, err) => {
  err && err instanceof Error && server.log.error(err)
  res.send(err)
})

module.exports = { server }
