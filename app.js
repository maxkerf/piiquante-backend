const express = require("express");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");

const app = express();

// Avoid CORS errors
app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
	res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");

	// Response to preflight request must have http ok status (it allows us to use "router.use(someMiddleware)" without CORS errors)
	if (req.method === "OPTIONS") return res.sendStatus(200);

	next();
});

// Avoid "/images" URLs considered as routes/requests
app.use("/images", express.static("images"));

// Parse requests with JSON & create a body object (req.body)
app.use(express.json());

// Sanitize request data to prevent MongoDB operator injection
app.use(mongoSanitize());

// Limit repeated requests to the API
const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply the rate limiting middleware to API calls only
app.use("/api", apiLimiter);

const userRoutes = require("./routes/user");
const sauceRoutes = require("./routes/sauce");

app.use("/api/auth", userRoutes);
app.use("/api/sauces", sauceRoutes);

module.exports = app;
