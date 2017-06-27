const { UnsupportedMediaTypeError } = require('restify')

function requireJson(req, res, next) {
  if (![ 'GET', 'OPTIONS' ].includes(req.method)
      && getHeaderValue('Content-Type', req) !== 'application/json') {
    next(new UnsupportedMediaTypeError())
  }
  next()
}

function getHeaderValue(headerName, req) {
  headerName = headerName.toLowerCase()
  const header = Object.keys(req.headers)
    .find(h => h.toLowerCase() === headerName)

  if (!header) return null
  return req.headers[header]
}

module.exports = {
  requireJson
}
