const ipIsEqual = require('ip').isEqual
const unauthorized = require('boom').unauthorized

const register = (server, options, next) => {
  server.auth.scheme('ip-whitelist', function(serverAuth, whitelisted) {
    const list = whitelisted instanceof Array ? whitelisted : [whitelisted];

    return {
      authenticate(request, reply) {
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

exports.register = register