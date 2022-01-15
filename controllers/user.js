const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

/* INPUT CHECKS */

/**
 * Check if the password input is valid or not.
 *
 * If it is not valid, send a response with a 400 (bad request) to the client.
 * @param {*} data The data to check.
 * @param {Object} res The response object of the express app.
 * @returns {boolean} Boolean true if it is valid, false if not.
 */
const checkPassword = (data, res) => {
	let isValid = true;
	let message;

	// check if the data value is not empty or undefined
	if (data === "" || data === undefined) {
		isValid = false;
		message = "Mot de passe requis.";
	}
	// check if the data type is correct
	else if (typeof data !== "string") {
		isValid = false;
		message = "Le mot de passe doit être une chaîne de caractères.";
	}
	// check if the data value is correct
	else if (!(data.length <= 50)) {
		isValid = false;
		message = "Le mot de passe ne doit pas excéder 50 caractères.";
	}

	if (!isValid) res.status(400).json({ message });

	return isValid;
};

/* REQUESTS */

/**
 * Sign up a new user and store it in the database.
 *
 * If an error occured, send a 500 (internal server error) code to the client.
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

		if (!checkPassword(password, res)) return;

		const hashedPassword = await bcrypt.hash(password, 10);

		await User.create({
			email,
			password: hashedPassword,
		});

		res.status(201).json({ message: "Utilisateur créé !" });
	} catch (error) {
		res.status(400).json(error);
	}
};

/**
 * Login a user.
 *
 * If an error occured, send a 500 (internal server error) code to the client.
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

		if (!checkPassword(password, res)) return;

		const isValid = await bcrypt.compare(password, user.password);

		if (!isValid)
			return res.status(401).json({ message: "Mot de passe incorrect..." });

		const userId = user._id;
		const token = jwt.sign({ userId }, process.env.TOKEN_SECRET_KEY, {
			expiresIn: "24h",
		});

		res.status(200).json({ userId, token });
	} catch (error) {
		res.status(400).json(error);
	}
};
