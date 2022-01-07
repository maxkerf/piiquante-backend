require("dotenv").config();

const globalFunctions = require("./globalFunctions");

/**
 * Summarize the error using a short sentence, then show it completely.
 * @param {Object} error The error to handle.
 */
const errorHandler = error => {
	const bind = `Port ${error.port}`;

	switch (error.code) {
		case "EACCES":
			console.error(bind + " requires elevated privileges.");
			break;
		case "EADDRINUSE":
			console.error(bind + " is already in use.");
			break;
		default:
	}

	//globalFunctions.showError(error);
	process.exit(1);
};

const http = require("http");
const app = require("./app");

const server = http.createServer(app);

server.on("error", errorHandler);
server.on("listening", () =>
	console.log(`Listening on port ${server.address().port}!`)
);
try {
	server.listen(process.env.PORT || 3000);
} catch (error) {
	switch (error.code) {
		case "ERR_SOCKET_BAD_PORT":
			console.error("Port should be >= 0 and < 65536.");
			break;
		default:
			globalFunctions.showError(error);
	}

	process.exit(1);
}
