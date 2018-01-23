const ipIsEqual = require('ip').isEqual
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

function ipWhitelistScheme(server, whitelisted) {
	return {
		authenticate(request, h) {
			const { remoteAddress } = request.info

    const list = whitelisted instanceof Array ? whitelisted : [whitelisted];
			if (list.some(ip => ipIsEqual(ip, remoteAddress))) {
				return h.authenticated({ credentials: remoteAddress })
			}

			throw unauthorized(`${remoteAddress} is not a valid IP`)
        }
      }
}
