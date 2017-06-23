# hapi-auth-ip-whitelist

[![npm](https://img.shields.io/npm/v/hapi-auth-ip-whitelist.svg)](https://www.npmjs.com/package/hapi-auth-ip-whitelist)

# Usage

## Localhost

Only accept calls from localhost:

```js
server.auth.strategy('localhost', 'ip-whitelist', '127.0.0.1');
```

To be used like

```js
server.route({ method: 'GET', path: '/', config: {
  auth: 'localhost',
  handler: function(request, reply) { reply("That was from localhost!");}
}});
```

In the route receives a request from a different IP, it will respond a `401 unauthorized` error with the message `192.168.0.102 is not a valid IP`, where `192.168.0.102` is the IP of the request.

## MercadoPago

You can also specify several IPs by passing a list instead. For example, consider the IPs to expect requests from, as specified by [MercadoPago](https://www.mercadopago.com.co/developers/en/api-docs/basics/design-considerations).

```js
server.auth.strategy(
  'mercado-pago-webhook',
  'ip-whitelist',
  _.flatMap(
    ['209.225.49.*', '216.33.197.*', '216.33.196.*', '63.128.82.*', '63.128.83.*', '63.128.94.*'],
    (part) => _.times(256, (n) => _.replace(part, '*', _.toString(n)))
  )
);
```
