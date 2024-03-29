const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Check with the "jsonwebtoken" library if the token specified in the authorization header is valid or not.
 *
 * If an error occured, send a response with a 401 (unauthorized) code to the client.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.token = async (req, res, next) => {
	try {
		// optional chaining "?." checks if authorization exists or not & return "undefined" if not
		const token = req.headers.authorization?.split(" ")[1];
		const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
		const userId = decodedToken.userId;

		// check if the user still exists
		const user = await User.findById(userId);
		if (!user) throw { message: "L'utilisateur n'existe plus" };

		if (req.body.userId && req.body.userId !== userId)
			throw { message: "Non autorisé" };

		res.locals.userId = userId;

		next();
	} catch (e) {
		res.status(401).json(e);
	}
};

/**
 * Check if the sauce truly belongs to the requester.
 *
 * If the sauce does not belong to the requester, send a response with a 403 (forbidden) code to the client.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns If the sauce does not belong to the requester, stop the process by returning the function.
 */
exports.sauce = (req, res, next) => {
	const userId = res.locals.userId;
	const sauce = res.locals.sauce;

	if (sauce.userId !== userId)
		return res.status(403).json({ message: "Sauce non possédée..." });

	next();
};
