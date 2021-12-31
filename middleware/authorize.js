const jwt = require("jsonwebtoken");

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
	// check if the sauce truly belongs to the requester
	if (req.sauce.userId !== res.locals.tokenUserId)
		return res.status(403).json({ error: "Sauce non possédée..." });

	next();
};
