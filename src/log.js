const pkg              = require('../package.json')
const { createLogger } = require('bunyan')

const logger = createLogger({ name: pkg.name })

module.exports = { logger }
