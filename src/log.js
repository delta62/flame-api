const pkg              = require('../package.json')
const config           = require('config')
const { createLogger } = require('bunyan')

const streams = [{
  stream: process.stdout
}]

if (config.has('logPath')) {
  streams.push({ path: config.get('logPath') })
}

const logger = createLogger({
  name: pkg.name,
  streams
})

module.exports = { logger }
