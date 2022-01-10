const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const checkEmail = (data, res) => {
	let isValid = true;
	let message;
	// same regex as the one used in type="email" from W3C (found on https://emailregex.com/)
	const regex =
		/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

	// check if the data value is not empty or undefined
	if (data === "" || data === undefined) {
		isValid = false;
		message = "Email requis.";
	}
	// check if the data type is correct
	else if (typeof data !== "string") {
		isValid = false;
		message = "L'email doit être une chaîne de caractères.";
	}
	// check if the data value is correct
	else if (!regex.exec(data)) {
		isValid = false;
		message = "L'email est invalide.";
	} else if (!(data.length <= 50)) {
		isValid = false;
		message = "L'email ne doit pas excéder 50 caractères.";
	}

	if (!isValid) res.status(400).json({ message });

	return isValid;
};

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

const checkSignUpForm = (email, password, res) => {
	return checkEmail(email, res) && checkPassword(password, res);
};

exports.signup = async (req, res) => {
	try {
		const email = req.body.email;
		const password = req.body.password;

		if (!checkSignUpForm(email, password, res)) return;

		const hashedPassword = await bcrypt.hash(password, 10);

		const user = new User({
			email,
			password: hashedPassword,
		});

		await user.save();

		res.status(201).json({ message: "Utilisateur créé !" });
	} catch (error) {
		if (error._message === "User validation failed")
			return res.status(400).json({ message: "Email déjà utilisé..." });

		res.status(500).json({ error });
	}
};

exports.login = async (req, res) => {
	try {
		const email = req.body.email;
		const password = req.body.password;

		if (!checkSignUpForm(email, password, res)) return;

		const user = await User.findOne({ email });

		if (!user)
			return res.status(400).json({ message: "Utilisateur non trouvé..." });

		const isValid = await bcrypt.compare(password, user.password);

		if (!isValid)
			return res.status(401).json({ message: "Mot de passe incorrect..." });

		res.status(200).json({
			userId: user._id,
			token: jwt.sign({ userId: user._id }, process.env.TOKEN_SECRET_KEY, {
				expiresIn: "24h",
			}),
		});
	} catch (error) {
		res.status(500).json({ error });
	}
};
