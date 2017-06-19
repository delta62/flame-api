function reqStartTimer(req, res, next) {
  req.time = process.hrtime()
  next()
}

function reqEndTimer(req) {
  const end = process.hrtime(req.time)
  const s   = end[0] * 1000
  const ms  = end[1] / 1000000
  req.time = Math.round(s + ms)
}

module.exports = {
  reqStartTimer,
  reqEndTimer
}
