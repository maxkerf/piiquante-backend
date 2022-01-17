const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

/* INPUT CHECKS */

/**
 * Check if the password input is valid or not.
 *
 * If it is not valid, throw an error.
 * @param {*} data The data to check.
 */
const checkPassword = data => {
	// check if the data value is not empty, undefined or null
	if (data === "" || data === undefined || data === null)
		throw Error("Mot de passe requis.");
	// check if the data type is correct
	else if (typeof data !== "string")
		throw Error("Le mot de passe doit être une chaîne de caractères.");
	// check if the data value is correct
	else if (!(data.length <= 50))
		throw Error("Le mot de passe ne doit pas excéder 50 caractères.");
};

/* REQUESTS */

/**
 * Sign up a new user and store it in the database.
 *
 * If an error is detected (checkings, etc.), send a 400 (bad request) code to the client.
 *
 * If everything goes well, send a 201 (created) code to the client.
 * @param {*} req
 * @param {*} res
 * @returns If an error occured or is detected, stop the process by catching the error or returning the function.
 */
exports.signup = async (req, res) => {
	try {
		const email = req.body.email;
		const password = req.body.password;

		checkPassword(password);

		const hashedPassword = await bcrypt.hash(password, 10);

		await User.create({
			email,
			password: hashedPassword,
		});

		res.status(201).json({ message: "Utilisateur créé !" });
	} catch (e) {
		res.status(400).json({ message: e.message });
	}
};

/**
 * Login a user.
 *
 * If an error is detected (checkings, etc.), send a 400 (bad request) code to the client.
 *
 * If everything goes well, send a 200 (OK) code to the client with an access token for further requests.
 * @param {*} req
 * @param {*} res
 * @returns If an error occured or is detected, stop the process by catching the error or returning the function.
 */
exports.login = async (req, res) => {
	try {
		const email = req.body.email;
		const password = req.body.password;

		const user = await User.findOne({ email });

		if (!user)
			return res.status(400).json({ message: "Utilisateur non trouvé..." });

		checkPassword(password);

		const isValid = await bcrypt.compare(password, user.password);

		if (!isValid)
			return res.status(401).json({ message: "Mot de passe incorrect..." });

		const userId = user._id;
		const token = jwt.sign({ userId }, process.env.TOKEN_SECRET_KEY, {
			expiresIn: "24h",
		});

		res.status(200).json({ userId, token });
	} catch (e) {
		res.status(400).json({ message: e.message });
	}
};
