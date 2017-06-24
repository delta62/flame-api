Promise.fromNodeCallback = function(cb, ...args) {
  return new Promise((resolve, reject) => {
    args.push((err, data) => err ? reject(err) : resolve(data))
    cb.apply(cb, args)
  })
}
