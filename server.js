const dotenv = require("dotenv");
dotenv.config();

/* Step 1: connect to the MongoDB database asynchronously */
require("./database");

/* Step 2: create & configurate the express app */
const app = require("./app");

/* Step 3: create & launch the http server */
const http = require("http");
const server = http.createServer(app);

try {
	server.listen(process.env.PORT || 3000);
} catch (error) {
	console.error(error);
	process.exit(1); // the app can't run without the backend server on
}

server.on("listening", () => {
	console.log("Welcome to Piiquante 🌶");
	console.log(`Listening on port ${server.address().port} ✔`);
});
server.on("error", error => {
	console.error(error);
	process.exit(1);
});
