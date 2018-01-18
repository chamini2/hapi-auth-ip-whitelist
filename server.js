const Hapi = require('hapi');
const plugin = require('./lib/index');
const moduleName = require('./package').name;

const server = new Hapi.Server({
	host: process.env.HOST || 'localhost',
	address: process.env.IP || '0.0.0.0',
	port: process.env.PORT || 3000,
	routes: {
		cors: true
	},
	debug: {
		log: ['error'],
		request: ['error']
	}
});

// register plugin
server.register(plugin.default)
	.then(() => {
		// specify auth strategies
		server.auth.strategy('localhost', 'ip-whitelist', ['127.0.0.1']);
		server.auth.strategy('ip_outside_our_control', 'ip-whitelist', ['8.8.8.8']);  // only allow IP that will never visit
	})
	.then(() => {
		const routes = [
			{
				method: 'GET',
				path: '/',
				handler(request, h) {
					const url = request.server.info.uri
					return `Visit ${url}/authenticated to test successfully authenticated request or ${url}/unauthenticated to test unathenticated request.`;
				},
				options: {
					auth: false
				}
			},
			{
				method: 'GET',
				path: '/authenticated',
				handler(request, h) {
					return 'Authenticated request!';
				},
				options: {
					auth: 'localhost'
				}
			},
			{
				method: 'GET',
				path: '/unauthenticated',
				handler(request, h) {
					return 'This should not happen, should get 401 unathenticated!';
				},
				options: {
					auth: 'ip_outside_our_control'
				}
			}
		]

		// register routes after auth strategies are registered
		server.route(routes)
	})
	.then(async () => {
		// Start the server
		await server.start();
		console.log(`Example server for ${moduleName} running at: ${server.info.uri}`);
	})
	.catch(err => {
		console.error(err)
	});