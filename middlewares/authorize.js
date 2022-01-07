const jwt = require("jsonwebtoken");

exports.token = (req, res, next) => {
	try {
		// optional chaining "?." checks if authorization exists or not & return "undefined" if not
		const token = req.headers.authorization?.split(" ")[1];
		const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET_KEY);

		res.locals.userId = decodedToken.userId;

		next();
	} catch (error) {
		res.status(401).json({ error });
	}
};

exports.sauce = (req, res, next) => {
	const userId = res.locals.userId;
	const sauce = res.locals.sauce;

	// check if the sauce truly belongs to the requester
	if (sauce.userId !== userId)
		return res.status(403).json({ message: "Sauce non possédée..." });

	next();
};
