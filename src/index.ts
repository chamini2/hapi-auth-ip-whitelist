import { isEqual as ipIsEqual } from 'ip';
import { getClientIp, Request as RequestInterface } from 'request-ip';
import { unauthorized } from 'boom';
const pkg = require('../package.json');

export default {
	name: pkg.name,
	version: pkg.version,
	pkg,
	register(server:any, options:object) {
		server.auth.scheme('ip-whitelist', ipWhitelistScheme)
	}
};

function ipWhitelistScheme(server:any, whitelisted: string | string[]) {
	return {
		authenticate(request:RequestInterface, h:any) {
			const remoteAddress:string = getClientIp(request)

			const list = whitelisted instanceof Array ? whitelisted : [whitelisted];
			if (list.some((ip:string) => ipIsEqual(ip, remoteAddress))) {
				return h.authenticated({ credentials: remoteAddress })
			}

			throw unauthorized(`${remoteAddress} is not a valid IP`)
		}
	}
}

