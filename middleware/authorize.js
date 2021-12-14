const jwt = require("jsonwebtoken");

module.exports = (req, rest, next) => {
	try {
		const token = req.headers.authorization.split(" ")[1];
		const decodedToken = jwt.verify(token, "RANDOM_TOKEN_SECRET");
		const userId = decodedToken.userId;

		if (req.body.userId && req.body.userId !== userId) {
			throw "User ID non valable...";
		} else {
			next();
		}
	} catch (error) {
		rest.status(401).json({ error: error | "Requête non authentifiée..." });
	}
};
