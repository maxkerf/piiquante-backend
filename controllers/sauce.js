const fs = require("fs");
const Sauce = require("../models/Sauce");

const LIKE = 1;
const DISLIKE = -1;
const UNLIKE = 0;
const UNDISLIKE = UNLIKE;
const IMG_DIR_PATH = "images/";
const TMP_IMG_DIR_PATH = "images/tmp/";

/* INPUT CHECKS */

/**
 * Check if the like status input is valid or not.
 *
 * If it is not valid, throw an error.
 * @param {*} data The data to check.
 */
const checkLikeStatus = data => {
	// check if the data value is not undefined or null
	if (data === undefined || data === null)
		throw Error("L'état du like est requis.");
	// check if the data type is correct
	else if (typeof data !== "number")
		throw Error("L'état du like doit être un nombre.");
	// check if the data value is correct
	else if (!(data >= -1 && data <= 1))
		throw Error("L'état du like doit être compris entre -1 et 1.");
};

/* MANAGE IMAGE FILE */

/**
 * Remove the given image from the server.
 * @param {string} filename The filename of the image to remove.
 */
const removeImage = filename => {
	fs.unlinkSync(IMG_DIR_PATH + filename);
};

/**
 * Remove the given image from the server temporary directory.
 * @param {string} filename The filename of the image to remove.
 */
const removeTemporaryImage = filename => {
	fs.unlinkSync(TMP_IMG_DIR_PATH + filename);
};

/**
 * Save the given image on the server by moving it from the temporary directory to the final one.
 * @param {string} filename The filename of the image to save.
 */
const saveImage = filename => {
	const oldPath = TMP_IMG_DIR_PATH + filename;
	const newPath = IMG_DIR_PATH + filename;

	fs.renameSync(oldPath, newPath);
};

/* REQUESTS */

/**
 * Get all the sauces from the database.
 *
 * If an error occured, send a 500 (internal server error) code to the client.
 *
 * If everything goes well, send a 200 (OK) code to the client with the desired data.
 * @param {*} req
 * @param {*} res
 */
exports.getAllSauces = (req, res) => {
	Sauce.find()
		.then(sauces => res.status(200).json(sauces))
		.catch(e => res.status(500).json({ message: e.message }));
};

/**
 * Create a sauce and store it in the database.
 *
 * If an error is detected (checkings, etc.), send a 400 (bad request) code to the client.
 *
 * If everything goes well, send a 201 (created) code to the client.
 * @param {*} req
 * @param {*} res
 * @returns If an error occured or is detected, stop the process by catching the error or returning the function.
 */
exports.createSauce = async (req, res) => {
	if (!req.file) return res.status(400).json({ message: "Image requise." });

	const sauceObject = req.body.sauce ? JSON.parse(req.body.sauce) : {};
	const filename = req.file.filename;

	// replace or specify the user id of the sauce in creation by/with the user id of the decoded token
	sauceObject.userId = res.locals.userId;
	sauceObject.imageUrl = `${req.protocol}://${req.get(
		"host"
	)}/images/${filename}`;

	try {
		await Sauce.create({
			...sauceObject,
			likes: 0,
			dislikes: 0,
			usersLiked: [],
			usersDisliked: [],
		});

		saveImage(filename);

		res.status(201).json({ message: "Sauce enregistrée !" });
	} catch (e) {
		removeTemporaryImage(filename);

		res.status(400).json({ message: e.message });
	}
};

/**
 * Get one sauce from the database.
 *
 * The process of getting the sauce is already done in the "router.param("id")" function in the sauces routes file (routes/sauce.js).
 *
 * Send a 200 (OK) code to the client with the desired data.
 * @param {*} req
 * @param {*} res
 */
exports.getOneSauce = (req, res) => {
	res.status(200).json(res.locals.sauce);
};

/**
 * Update a sauce stored in the database.
 *
 * If an error is detected (checkings, etc.), send a 400 (bad request) code to the client.
 *
 * If everything goes well, send a 200 (OK) code to the client.
 * @param {*} req
 * @param {*} res
 * @returns If an error occured or is detected, stop the process by catching the error or returning the function.
 */
exports.updateSauce = async (req, res) => {
	// first, good to know that a sauce can be updated following two different ways:
	// - without the image file => JSON ("application/json") received in the request & parsed by express.json() (req.body)
	// - with the image file => "multipart/form-data" received in the request & parsed by multer (req.file & req.body)

	const sauce = res.locals.sauce;

	// WITH THE IMAGE FILE
	if (req.headers["content-type"].includes("multipart/form-data")) {
		if (!req.file) return res.status(400).json({ message: "Image requise." });

		const sauceObject = req.body.sauce ? JSON.parse(req.body.sauce) : {};
		const filename = req.file.filename;
		const oldFilename = sauce.imageUrl.split("/images/")[1];

		sauceObject.imageUrl = `${req.protocol}://${req.get(
			"host"
		)}/images/${filename}`;
		// those props can be modified but not by this way, delete them if there are specified in the request
		delete sauceObject.likes;
		delete sauceObject.dislikes;
		delete sauceObject.usersLiked;
		delete sauceObject.usersDisliked;

		Object.assign(sauce, sauceObject);

		try {
			await sauce.save();

			removeImage(oldFilename);
			saveImage(filename);

			res.status(200).json({ message: "Sauce modifiée !" });
		} catch (e) {
			removeTemporaryImage(filename);

			res.status(400).json({ message: e.message });
		}
	}
	// WITHOUT THE IMAGE FILE
	else {
		const sauceObject = { ...req.body };
		// those props can be modified but not by this way, delete them if there are specified in the request
		delete sauceObject.imageUrl;
		delete sauceObject.likes;
		delete sauceObject.dislikes;
		delete sauceObject.usersLiked;
		delete sauceObject.usersDisliked;

		Object.assign(sauce, sauceObject);

		sauce
			.save()
			.then(() => res.status(200).json({ message: "Sauce modifiée !" }))
			.catch(e => res.status(400).json({ message: e.message }));
	}
};

/**
 * Delete a sauce stored in the database.
 *
 * If an error is detected (checkings, etc.), send a 400 (bad request) code to the client.
 *
 * If everything goes well, send a 200 (OK) code to the client.
 * @param {*} req
 * @param {*} res
 */
exports.deleteSauce = (req, res) => {
	const sauce = res.locals.sauce;
	const filename = sauce.imageUrl.split("/images/")[1];

	removeImage(filename);

	Sauce.deleteOne({ _id: sauce._id })
		.then(() => res.status(200).json({ message: "Sauce supprimée !" }))
		.catch(e => res.status(400).json({ message: e.message }));
};

/**
 * Like a sauce stored in the database.
 *
 * If an error is detected (checkings, etc.), send a 400 (bad request) code to the client.
 *
 * If everything goes well, send a 200 (OK) code to the client.
 * @param {*} req
 * @param {*} res
 * @returns If an error occured or is detected, stop the process by catching the error or returning the function.
 */
exports.likeSauce = (req, res) => {
	const userId = res.locals.userId;
	const sauce = res.locals.sauce;
	const likeStatus = req.body.like;
	let message;

	try {
		checkLikeStatus(likeStatus);

		switch (likeStatus) {
			case LIKE:
				if (sauce.hasLiked(userId)) throw Error("Sauce déjà likée...");
				else if (sauce.hasDisliked(userId)) sauce.undislike(userId);

				sauce.like(userId);
				message = "Sauce likée !";
				break;

			case DISLIKE:
				if (sauce.hasDisliked(userId)) throw Error("Sauce déjà dislikée...");
				else if (sauce.hasLiked(userId)) sauce.unlike(userId);

				sauce.dislike(userId);
				message = "Sauce dislikée !";
				break;

			case UNLIKE:
			case UNDISLIKE:
				if (sauce.hasLiked(userId)) {
					sauce.unlike(userId);
					message = "Sauce unlikée !";
				} else if (sauce.hasDisliked(userId)) {
					sauce.undislike(userId);
					message = "Sauce undislikée !";
				} else {
					throw Error("Sauce pas likée ni dislikée...");
				}
				break;

			default:
		}
	} catch (e) {
		return res.status(400).json({ message: e.message });
	}

	sauce
		.save()
		.then(() => res.status(200).json({ message }))
		.catch(e => res.status(400).json({ message: e.message }));
};
