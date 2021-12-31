const express = require("express");
const mongoose = require("mongoose");

const userRoutes = require("./routes/user");
const sauceRoutes = require("./routes/sauce");

mongoose
	.connect(process.env.MONGO_DB_KEY, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => console.log("Connexion à MongoDB réussie !"))
	.catch(() =>
		console.error(
			'Connexion à MongoDB échouée...\nVeuillez consulter le fichier "README.md" pour plus d\'informations.'
		)
	);

const app = express();

// avoid CORS errors
app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
	res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");

	// Response to preflight request must have http ok status (it allows me to use "router.use(someMiddleware)" without CORS errors)
	if (req.method === "OPTIONS") {
		res.sendStatus(200);
		return;
	}

	next();
});

// avoid "/images" URLs considered as routes
app.use("/images", express.static("images"));

// parse requests with JSON & create a body object (req.body)
app.use(express.json());

app.use("/api/auth", userRoutes);
app.use("/api/sauces", sauceRoutes);

module.exports = app;
