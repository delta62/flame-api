const pkg = require('../../package.json')

function statusGetHandler(req, res, next) {
  res.json({
    version: pkg.version,
    uptime: Math.floor(process.uptime())
  })
  next()
}

module.exports = { statusGetHandler }
