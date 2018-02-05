# hapi-auth-ip-whitelist

[![npm](https://img.shields.io/npm/v/hapi-auth-ip-whitelist.svg)](https://www.npmjs.com/package/hapi-auth-ip-whitelist)

## Usage

### Localhost

Only accept calls from localhost:

```js
server.auth.strategy('localhost', 'ip-whitelist', ['127.0.0.1']);
```

*NOTE: Third parameter of server.auth.strategy is options which must be an object.* 

To be used like

```js
server.route({ 
  method: 'GET', 
  path: '/',
  handler(request, h) { return "That was from localhost!" }, 
  options: { auth: 'localhost' }
});
```

In the route receives a request from a different IP, it will respond a `401 unauthorized` error with the message `192.168.0.102 is not a valid IP`, where `192.168.0.102` is the IP of the request.

### MercadoPago

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

### Behind proxy

In case you are behind a proxy, use Hapi plugin `therealyou`.
It will find the "real" IP in X-Forward headers and modify the request.info.remoteAddress.

```js
server.register([
  {
    plugin: require('therealyou')
  },
  {
    plugin: require('hapi-auth-ip-whitelist')
  }
])
```

## Example server

Start local example server with

```bash
npm start
```

then visit [http://localhost:3000](http://localhost:3000).

Successfully authenticated request [http://localhost:3000/authenticated](http://localhost:3000/authenticated).
Unauthenticated request [http://localhost:3000/unauthenticated](http://localhost:3000/unauthenticated).