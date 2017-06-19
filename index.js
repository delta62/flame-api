const server = require('./src/server').server
const config = require('config')

server.listen(config.get('port'), () => {
  console.log(`${server.name} listening on ${server.url}`)
})
