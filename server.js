const errorHandler = error => {
	if (error.syscall !== "listen") throw error;

	const address = server.address();
	/* const bind =
		typeof address === "string" ? "pipe " + address : "port: " + port; */
	const bind = `port: ${address.port}`;

	switch (error.code) {
		case "EACCES":
			console.error(bind + " requires elevated privileges.");
			process.exit(1);
			break;
		case "EADDRINUSE":
			console.error(bind + " is already in use.");
			process.exit(1);
			break;
		default:
			throw error;
	}
};

const http = require("http");
require("dotenv").config();
const app = require("./app");

const server = http.createServer(app);

server.on("error", errorHandler);
server.on("listening", () =>
	console.log(`Listening on port ${server.address().port}`)
);

/* const address = server.address();
const bind =
	typeof address === "string" ? `pipe ${address}` : `port ${address.port}`;
console.log(`Listening on ${bind}`); */

server.listen(process.env.PORT);
