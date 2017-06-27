function reqStartTimer(req, res, next) {
  req.reqTime = process.hrtime()
  next()
}

function reqEndTimer(req) {
  if (!req.reqTime) return

  const end = process.hrtime(req.reqTime)
  const s   = end[0] * 1000
  const ms  = end[1] / 1000000
  req.reqTime = Math.round(s + ms)
}

module.exports = {
  reqStartTimer,
  reqEndTimer
}
