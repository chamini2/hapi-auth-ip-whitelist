const ipIsEqual = require('ip').isEqual
const getClientIp = require('request-ip').getClientIp
const unauthorized = require('boom').unauthorized
const pkg = require('../package')

exports.default = {
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
			const remoteAddress = getClientIp(request)

			const list = whitelisted instanceof Array ? whitelisted : [whitelisted];
			if (list.some(ip => ipIsEqual(ip, remoteAddress))) {
				return h.authenticated({ credentials: remoteAddress })
			}

			throw unauthorized(`${remoteAddress} is not a valid IP`)
		}
	}
}
