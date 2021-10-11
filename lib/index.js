const ipLib = require('ip')
const unauthorized = require('boom').unauthorized
const pkg = require('../package')

exports.plugin = {
  name: pkg.name,
  version: pkg.version,
  pkg,
  register(server, options) {
    server.auth.scheme('ip-whitelist', ipWhitelistScheme)
  }
}

function matches(ip, remoteAddress) {
  if (ipLib.isV4Format(ip) || ipLib.isV6Format(ip)) {
    return ipLib.isEqual(ip, remoteAddress);
  }

  if (ip.includes("/")) {
    return ipLib.cidrSubnet(ip).contains(remoteAddress);
  }

  return false;
}

function ipWhitelistScheme(server, whitelisted) {
  return {
    authenticate(request, h) {
      const { remoteAddress } = request.info

      const list = whitelisted instanceof Array ? whitelisted : [whitelisted]

      if (list.some(ip => matches(ip, remoteAddress))) {
          return h.authenticated({ credentials: remoteAddress })
      }

      throw unauthorized(`${remoteAddress} is not a valid IP`)
    }
  }
}
