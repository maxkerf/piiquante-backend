const express = require("express");
const mongoose = require("mongoose");

const app = express();

mongoose
	.connect(
		"mongodb+srv://Max:fVD6eJwL4vXkxccL@piiquante.1hgfn.mongodb.net/piiquante?retryWrites=true&w=majority",
		{ useNewUrlParser: true, useUnifiedTopology: true }
	)
	.then(() => console.log("Connexion à MongoDB réussie !"))
	.catch(() => console.error("Connexion à MongoDB échouée..."));

app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
	);
	res.setHeader(
		"Access-Control-Allow-Methods",
		"GET, POST, PUT, DELETE, PATCH, OPTIONS"
	);
	next();
});

module.exports = app;
