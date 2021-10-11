const Hapi = require('hapi')
const ipLib = require('ip')
const plugin = require('./lib')
const moduleName = require('./package').name

const server = new Hapi.Server({
  host: process.env.HOST || 'localhost',
  address: process.env.IP || '0.0.0.0',
  port: process.env.PORT || 3000,
  routes: {
    cors: true
  },
  debug: {
    log: ['error'],
    request: ['error']
  }
})

// register plugin
server.register([
  // Uncomment to get correct IP of client when running behind a proxy, therealyou is entirely optional
  /*
  {
    plugin: require('therealyou')
  },
  */
  {
    plugin
  }
])
  .then(() => {
    // specify auth strategies
    server.auth.strategy('local_network', 'ip-whitelist', ['192.168.0.0/23']) // Use CIDR
    server.auth.strategy('localhost', 'ip-whitelist', ['127.0.0.1'])
    server.auth.strategy('ip_outside_our_control', 'ip-whitelist', ['8.8.8.8'])  // only allow IP that will never visit
  })
  .then(() => {
    const routes = [
      {
        method: 'GET',
        path: '/',
        handler(request, h) {
          const {host, port} = request.server.info
          const localip = ipLib.address()
          const localhostUrl = `${host}:${port}/localhost`
          const localNetWorkUrl = `${localip}:${port}/local`
          const unauthUrl = `${host}:${port}/unauth`
          return `
          <ul>
          <li>Visit <a href="//${localhostUrl}">${localhostUrl}</a> to test successfully authenticated requests.</li>
          <li>Visit <a href="//${localNetWorkUrl}">${localNetWorkUrl}</a> to test CIDR requests, it should work from other computers in your network too.</li>
          <li>Visit <a href="//${unauthUrl}">${unauthUrl}</a> to test a rejection because of an unauthorized requests.</li>
          </ul>
          `
        },
        options: {
          auth: false
        }
      },
      {
        method: 'GET',
        path: '/local',
        handler(request, h) {
          return `Authorized request from ${request.auth.credentials}`
        },
        options: {
          auth: 'local_network'
        }
      },
      {
        method: 'GET',
        path: '/localhost',
        handler(request, h) {
          return `Authorized request from ${request.auth.credentials}`
        },
        options: {
          auth: 'localhost'
        }
      },
      {
        method: 'GET',
        path: '/unauth',
        handler(request, h) {
          return 'This should not happen, should get 401 unauthorized!'
        },
        options: {
          auth: 'ip_outside_our_control'
        }
      }
    ]

    // register routes after auth strategies are registered
    server.route(routes)
  })
  .then(async () => {
    // Start the server
    await server.start()
    console.log(`Example server for ${moduleName} running at: ${server.info.uri}`)
  })
  .catch(err => {
    console.error(err)
  })
