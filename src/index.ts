import { Server } from 'hapi';
import { isEqual as ipIsEqual } from 'ip';
import { unauthorized } from 'boom';
import castArray = require('lodash.castarray');
import some = require('lodash.some');

export function register<Options>(server: Server, options: Options, next: (err?: Error) => void): void {
  server.auth.scheme('ip-whitelist', function(server, whitelisted: string | string[]) {
    const list = castArray(whitelisted);

    return {
      authenticate(request, reply) {
        // in case you are behind a proxy, use Hapi plugin `therealyou`
        const { remoteAddress } = request.info;
        if (some(list, (address) => ipIsEqual(remoteAddress, address))) {
          reply.continue({ credentials: remoteAddress });
        } else {
          reply(unauthorized(`${remoteAddress} is not a valid IP`));
        }
      }
    };
  });
};

exports.register.attributes = {
  pkg: require('../package.json')
};
