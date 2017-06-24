Promise.fromNodeCallback = function(cb, ...args) {
  return new Promise((resolve, reject) => {
    args.push((err, data) => {
      if (err) reject(err)
      else resolve(data)
    })
    cb.apply(cb, args)
  })
}
