const globalFunctions = require("./globalFunctions");

/* Step 1: connect to the MongoDB database asynchronously */

const mongoose = require("mongoose");

mongoose
	.connect(process.env.MONGO_DB_KEY)
	.then(() => console.log("Connected to MongoDB!"))
	.catch(error => {
		console.error("Failed to connect to MongoDB...");
		globalFunctions.showError(error);
	});

// handle errors after initial connection was established
mongoose.connection.on("error", globalFunctions.showError);

/* Step 2: create & configurate the express app */

const express = require("express");
const app = express();

// avoid CORS errors
app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
	res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");

	// Response to preflight request must have http ok status (it allows me to use "router.use(someMiddleware)" without CORS errors)
	if (req.method === "OPTIONS") return res.sendStatus(200);

	next();
});
// avoid "/images" URLs considered as routes
app.use("/images", express.static("images"));
// parse requests with JSON & create a body object (req.body)
app.use(express.json());

const userRoutes = require("./routes/user");
const sauceRoutes = require("./routes/sauce");

app.use("/api/auth", userRoutes);
app.use("/api/sauces", sauceRoutes);

module.exports = app;
