const express = require("express");

const app = express();

app.use((req, res) => {
	console.log("Requête reçue !");
	res.status(200).json("Votre requête a bien été reçue !");
});

module.exports = app;
