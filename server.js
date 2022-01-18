const dotenv = require("dotenv");
dotenv.config();

const http = require("http");
const app = require("./app");
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
