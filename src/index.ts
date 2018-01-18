import { PluginFunction } from 'hapi';
import { isEqual as ipIsEqual } from 'ip';
import { getClientIp } from 'request-ip';
import { unauthorized } from 'boom';
import castArray = require('lodash.castarray');
import some = require('lodash.some');

export const register: PluginFunction<{}> = function(server, options, next) {
  server.auth.scheme('ip-whitelist', function(server, whitelisted: string | string[]) {
    const list = castArray(whitelisted);

    return {
      authenticate(request, reply) {
        const remoteAddress = getClientIp(request);
        if (some(list, (address) => ipIsEqual(remoteAddress, address))) {
          reply.continue({ credentials: remoteAddress });
        } else {
          reply(unauthorized(`${remoteAddress} is not a valid IP`));
        }
      }
    };
  });

  return next();
};

register.attributes = {
  pkg: require('../package.json')
}
