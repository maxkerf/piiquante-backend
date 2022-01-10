const fs = require("fs");

const Sauce = require("../models/Sauce");

const LIKE = 1;
const DISLIKE = -1;
const UNLIKE = 0;
const UNDISLIKE = UNLIKE;

/* LIKE LOGIC */

/**
 * Add a like to a sauce and add the user who liked it to the list of the users who liked it.
 * @param {Sauce} sauce The sauce to like.
 * @param {string} userId The id of the user who liked the sauce.
 */
const like = (sauce, userId) => {
	sauce.likes++;
	sauce.usersLiked.push(userId);
};

/**
 * Add a dislike to a sauce and add the user who disliked it to the list of the users who disliked it.
 * @param {Sauce} sauce The sauce to dislike.
 * @param {string} userId The id of the user who disliked the sauce.
 */
const dislike = (sauce, userId) => {
	sauce.dislikes++;
	sauce.usersDisliked.push(userId);
};

/**
 * Remove a like from a sauce and remove the user who unliked it from the list of the users who liked it.
 * @param {Sauce} sauce The sauce to unlike.
 * @param {string} userId The id of the user who unliked the sauce.
 */
const unlike = (sauce, userId) => {
	sauce.likes--;
	sauce.usersLiked.splice(sauce.usersLiked.indexOf(userId), 1);
};

/**
 * Remove a dislike from a sauce and remove the user who undisliked it from the list of the users who disliked it.
 * @param {Sauce} sauce The sauce to undislike.
 * @param {string} userId The id of the user who undisliked the sauce.
 */
const undislike = (sauce, userId) => {
	sauce.dislikes--;
	sauce.usersDisliked.splice(sauce.usersDisliked.indexOf(userId), 1);
};

/**
 * Check if the user has already liked the given sauce or not.
 * @param {Sauce} sauce
 * @param {string} userId
 * @return {boolean} Boolean true if the sauce is already liked by the user, false if not.
 */
const hasLiked = (sauce, userId) => {
	return sauce.usersLiked.find(id => id === userId);
};

/**
 * Check if the user has already disliked the given sauce or not.
 * @param {Sauce} sauce
 * @param {string} userId
 * @return {boolean} Boolean true if the sauce is already disliked by the user, false if not.
 */
const hasDisliked = (sauce, userId) => {
	return sauce.usersDisliked.find(id => id === userId);
};

/* CHECKS */

const checkName = (data, res) => {
	let isValid = true;
	let message;

	// check if the data value is not empty or undefined
	if (data === "" || data === undefined) {
		isValid = false;
		message = "Nom requis.";
	}
	// check if the data type is correct
	else if (typeof data !== "string") {
		isValid = false;
		message = "Le nom doit être une chaîne de caractères.";
	}
	// check if the data value is correct
	else if (!(data.length <= 50)) {
		isValid = false;
		message = "Le nom ne doit pas excéder 50 caractères.";
	}

	if (!isValid) res.status(400).json({ message });

	return isValid;
};

const checkManufacturer = (data, res) => {
	let isValid = true;
	let message;

	// check if the data value is not empty or undefined
	if (data === "" || data === undefined) {
		isValid = false;
		message = "Fabricant requis.";
	}
	// check if the data type is correct
	else if (typeof data !== "string") {
		isValid = false;
		message = "Le fabricant doit être une chaîne de caractères.";
	}
	// check if the data value is correct
	else if (!(data.length <= 50)) {
		isValid = false;
		message = "Le fabricant ne doit pas excéder 50 caractères.";
	}

	if (!isValid) res.status(400).json({ message });

	return isValid;
};

const checkDescription = (data, res) => {
	let isValid = true;
	let message;

	// check if the data value is not empty or undefined
	if (data === "" || data === undefined) {
		isValid = false;
		message = "Description requise.";
	}
	// check if the data type is correct
	else if (typeof data !== "string") {
		isValid = false;
		message = "La description doit être une chaîne de caractères.";
	}
	// check if the data value is correct
	else if (!(data.length <= 500)) {
		isValid = false;
		message = "La description ne doit pas excéder 500 caractères.";
	}

	if (!isValid) res.status(400).json({ message });

	return isValid;
};

const checkMainPepper = (data, res) => {
	let isValid = true;
	let message;

	// check if the data value is not empty or undefined
	if (data === "" || data === undefined) {
		isValid = false;
		message = "Principal ingrédient épicé requis.";
	}
	// check if the data type is correct
	else if (typeof data !== "string") {
		isValid = false;
		message =
			"Le principal ingrédient épicé doit être une chaîne de caractères.";
	}
	// check if the data value is correct
	else if (!(data.length <= 50)) {
		isValid = false;
		message =
			"Le principal ingrédient épicé ne doit pas excéder 50 caractères.";
	}

	if (!isValid) res.status(400).json({ message });

	return isValid;
};

const checkHeat = (data, res) => {
	let isValid = true;
	let message;

	// check if the data value is not empty or undefined
	if (data === "" || data === undefined) {
		isValid = false;
		message = "Ardeur requise.";
	}
	// check if the data type is correct
	else if (typeof data !== "number") {
		isValid = false;
		message = "L'ardeur doit être un nombre.";
	}
	// check if the data value is correct
	else if (!(data >= 1 && data <= 10)) {
		isValid = false;
		message = "L'ardeur doit être comprise entre 1 et 10.";
	}

	if (!isValid) res.status(400).json({ message });

	return isValid;
};

const checkLikeStatus = (data, res) => {
	let isValid = true;
	let message;

	// check if the data value is not empty or undefined
	if (data === "" || data === undefined) {
		isValid = false;
		message = "L'état du like est requis.";
	}
	// check if the data type is correct
	else if (typeof data !== "number") {
		isValid = false;
		message = "L'état du like doit être un nombre.";
	}
	// check if the data value is correct
	else if (!(data >= -1 && data <= 1)) {
		isValid = false;
		message = "L'état du like doit être compris entre -1 et 1.";
	}

	if (!isValid) res.status(400).json({ message });

	return isValid;
};

const checkAddSauceForm = (sauce, res) => {
	return (
		checkName(sauce.name, res) &&
		checkManufacturer(sauce.manufacturer, res) &&
		checkDescription(sauce.description, res) &&
		checkMainPepper(sauce.mainPepper, res) &&
		checkHeat(sauce.heat, res)
	);
};

/* REQUESTS */

exports.getAllSauces = (req, res) => {
	Sauce.find()
		.then(sauces => res.status(200).json(sauces))
		.catch(error => res.status(400).json({ error }));
};

exports.createSauce = (req, res) => {
	const sauceObject = JSON.parse(req.body.sauce ? req.body.sauce : "{}");
	// replace or specify the user id of the sauce in creation by/with the user id of the decoded token
	sauceObject.userId = res.locals.userId;

	// check image file input
	if (!req.file)
		return res.status(400).json({ message: "Fichier image requis." });

	// check every other inputs
	if (!checkAddSauceForm(sauceObject, res)) {
		// remove the image already saved by multer
		fs.unlink(`images/${req.file.filename}`, error => {
			if (error) console.error(error);
		});

		return;
	}

	const imageUrl = `${req.protocol}://${req.get("host")}/images/${
		req.file.filename
	}`;

	const sauce = new Sauce({
		...sauceObject,
		imageUrl,
		likes: 0,
		dislikes: 0,
		usersLiked: [],
		usersDisliked: [],
	});

	sauce
		.save()
		.then(() => res.status(201).json({ message: "Sauce enregistrée !" }))
		.catch(error => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res) => {
	res.status(200).json(res.locals.sauce);
};

exports.updateSauce = (req, res) => {
	const sauce = res.locals.sauce;

	// extract the content-type which could be more complex than just "application/json" for example
	const contentType = req.headers["content-type"].split(";")[0];

	// when using multipart/form-data the image file is required, otherwise, use a JSON file/body
	if (contentType === "multipart/form-data" && !req.file)
		return res.status(400).json({ message: "Fichier image requis." });

	const sauceObject = req.file
		? {
				...JSON.parse(req.body.sauce ? req.body.sauce : "{}"),
				imageUrl: `${req.protocol}://${req.get("host")}/images/${
					req.file.filename
				}`,
		  }
		: { ...req.body };

	// check every inputs
	if (!checkAddSauceForm(sauceObject, res)) {
		// remove the image already saved by multer
		if (req.file)
			fs.unlink(`images/${req.file.filename}`, error => {
				if (error) console.error(error);
			});

		return;
	}

	if (req.file) {
		// delete the previous image from the storage before sauce update
		const filename = sauce.imageUrl.split("/images/")[1];

		// update the sauce only if the old image file is deleted
		fs.unlink(`images/${filename}`, () => {
			Sauce.updateOne({ _id: sauce._id }, sauceObject)
				.then(() => res.status(200).json({ message: "Sauce modifiée !" }))
				.catch(error => res.status(500).json({ error }));
		});
	} else {
		Sauce.updateOne({ _id: sauce._id }, sauceObject)
			.then(() => res.status(200).json({ message: "Sauce modifiée !" }))
			.catch(error => res.status(500).json({ error }));
	}
};

exports.deleteSauce = (req, res) => {
	const sauce = res.locals.sauce;

	const filename = sauce.imageUrl.split("/images/")[1];

	// delete the sauce only if the image file is deleted
	fs.unlink(`images/${filename}`, () => {
		Sauce.deleteOne({ _id: sauce._id })
			.then(() => res.status(200).json({ message: "Sauce supprimée !" }))
			.catch(error => res.status(500).json({ error }));
	});
};

exports.likeSauce = (req, res) => {
	const userId = res.locals.userId;
	const sauce = res.locals.sauce;
	const likeStatus = req.body.like;
	let message;

	if (!checkLikeStatus(likeStatus, res)) return;

	switch (likeStatus) {
		case LIKE:
			if (hasLiked(sauce, userId))
				return res.status(400).json({ message: "Sauce déjà likée..." });
			else if (hasDisliked(sauce, userId)) undislike(sauce, userId);

			like(sauce, userId);
			message = "Sauce likée !";
			break;

		case DISLIKE:
			if (hasDisliked(sauce, userId))
				return res.status(400).json({ message: "Sauce déjà dislikée..." });
			else if (hasLiked(sauce, userId)) unlike(sauce, userId);

			dislike(sauce, userId);
			message = "Sauce dislikée !";
			break;

		case UNLIKE:
		case UNDISLIKE:
			if (hasLiked(sauce, userId)) {
				unlike(sauce, userId);
				message = "Sauce unlikée !";
			} else if (hasDisliked(sauce, userId)) {
				undislike(sauce, userId);
				message = "Sauce undislikée !";
			} else {
				return res
					.status(400)
					.json({ message: "Sauce pas likée ni dislikée..." });
			}
			break;

		default:
	}

	Sauce.updateOne({ _id: sauce._id }, sauce)
		.then(() => res.status(200).json({ message }))
		.catch(error => res.status(500).json({ error }));
};
