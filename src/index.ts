import { PluginFunction, Request, Server, ReplyWithContinue } from 'hapi';
import { isEqual as ipIsEqual } from 'ip';
import { unauthorized } from 'boom';

export const register: PluginFunction<{}> = function(server:Server, options, next) {
  server.auth.scheme('ip-whitelist', function(serverAuth:Server, whitelisted: string | string[]) {
    const list = whitelisted instanceof Array ? whitelisted : [whitelisted];
    //const list = [].concat(whitelisted); // TypeScript compiler complains but generates correct code

    return {
      authenticate(request:Request, reply:ReplyWithContinue) {
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