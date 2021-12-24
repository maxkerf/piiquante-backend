const jwt = require("jsonwebtoken");
const Sauce = require("../models/Sauce");

exports.token = (req, res, next) => {
	try {
		// optional chaining "?." checks if authorization exists or not & return "undefined" if not
		const token = req.headers.authorization?.split(" ")[1];
		const decodedToken = jwt.verify(token, "RANDOM_TOKEN_SECRET");
		const tokenUserId = decodedToken.userId;

		res.locals.tokenUserId = tokenUserId;

		next();
	} catch (error) {
		res.status(401).json({ error });
	}
};

exports.sauce = (req, res, next) => {
	const sauceId = req.params.id;

	if (sauceId) {
		// try to catch the user id of the sauce
		Sauce.findOne({ _id: sauceId })
			.then(sauce => {
				// check if the sauce truly belongs to the requester
				if (sauce.userId === res.locals.tokenUserId) {
					next();
				} else {
					res.status(403).json({ error: "Eh oh, ce n'est pas ta sauce !" });
				}
			})
			.catch(error => res.status(400).json({ error: "Sauce introuvable..." }));
	}
};
