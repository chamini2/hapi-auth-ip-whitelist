import { PluginFunction } from 'hapi';
import { isEqual as ipIsEqual } from 'ip';
import { unauthorized } from 'boom';

export const register: PluginFunction<{}> = function(server, options, next) {
  server.auth.scheme('ip-whitelist', function(server, whitelisted: string | string[]) {
    const list = whitelisted instanceof Array ? whitelisted : [whitelisted]

    return {
      authenticate(request, reply) {
        // in case you are behind a proxy, use Hapi plugin `therealyou`
        const { remoteAddress } = request.info;
        if (list.some(address => ipIsEqual(remoteAddress, address))) {
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
